import { Autocomplete, Box, Button, Checkbox, Chip, FormControl, FormControlLabel, FormHelperText, Grid, Grow, IconButton, MenuItem, Select, Stack, Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import moment from 'moment';
import React, { Component, useContext, useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, compareObjects, formatterRevenue, getFieldSelection, mapFieldToOption, routes } from 'src/global';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Container, TabPanel } from 'src/components/tab-panel/Wrapper';
import SwipeableViews from 'react-swipeable-views';
import TabLines from 'src/components/company-objective/TabLines';
import TabDeparment from 'src/components/company-objective/TabDeparment';

class DetailObjectiveLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            field_of_view: {},
            name: '',
            company_objective_id: {},
            listObjective: [],
            unit_id: {},
            listUnit: [],
            department_ids: [],
            is_active: false,
            message_is_follower: false,
            plan: 0,
            result: 0,
            companyObjectiveLine: {},
            isEditing: false,
            logActive: false,
            error: false,
            detailInfo: false
        };
    }


    componentDidMount() {
        this.init();
        this.checkShowDetail();
    }

    handleChangeActive = (event) => {
        const { is_active } = this.state
        console.log('event', event);
        this.setState({ isEditing: true, is_active: !is_active })
    };

    handleChangeFollower = (event) => {
        const { message_is_follower } = this.state
        console.log('event', event);
        this.setState({ isEditing: true, message_is_follower: !message_is_follower })
    };

    async onTextChangeUnit(value = '') {
        const { nameSearch } = this.props
        const json = await nameSearch('product.uom', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        this.setState({ listUnit: result })
    }

    async onTextChangeObjective(value = '') {
        const { nameSearch } = this.props
        const json = await nameSearch('company.objective', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        this.setState({ listObjective: result })
    }

    getLabel = (fieldName) => (this.state.field_of_view[fieldName] && this.state.field_of_view[fieldName].string || fieldName);

    checkShowDetail = () => {
        const { asComponent, id } = this.props
        if (asComponent || !id) {
            this.setState({ detailInfo: true })
            return
        }

        this.setState({ detailInfo: false })
    }

    handleDataCreationDepartment = async (newId, del) => {
        const { department_ids } = this.state
        console.log('department_ids', newId);
        if (del) {
            this.setState({ department_ids: newId, isEditing: true, });
        } else {
            this.setState({ isEditing: true, department_ids: [...department_ids, ...newId] });

        }
    };

    async detailInfo(id = '') {
        const { read } = this.props
        const json = await read('company.objective.line', [id], ['name', 'company_objective_id', 'plan',
            'result', 'department_ids', 'unit_id', 'is_active', 'message_is_follower'
        ])
        return json
    }

    debounce(fn, ms) {
        clearTimeout(this.timer)
        this.timer = setTimeout(fn, ms);
    }

    async cancel() {
        const { navigate, params } = this.props
        if (!params.get('id')) {
            navigate({ pathname: routes.companyObjective.path })
        } else {
            const { companyObjectiveLine } = this.state
            const unit = mapFieldToOption(companyObjectiveLine.unit_id, 'label')
            const objective = mapFieldToOption(companyObjectiveLine.company_objective_id, 'label')
            this.setState({
                name: companyObjectiveLine.name,
                plan: companyObjectiveLine.plan,
                unit_id: unit,
                company_objective_id: objective,
                is_active: companyObjectiveLine.is_active,
                department_ids: companyObjectiveLine.department_ids,
                message_is_follower: companyObjectiveLine.message_is_follower,
                isEditing: false,
                detailInfo: false
            })
        }
    }

    async handelSaveEdit() {
        const { params, setParams, write, showDialog, id, showNotification } = this.props
        const { companyObjectiveLine, name, company_objective_id, unit_id, plan, is_active, message_is_follower } = this.state
        const oldObj = {
            name: companyObjectiveLine.name,
            plan: companyObjectiveLine.plan,
            is_active: companyObjectiveLine.is_active,
            message_is_follower: companyObjectiveLine.message_is_follower,
            company_objective_id: companyObjectiveLine?.company_objective_id[0] || false,
            unit_id: companyObjectiveLine?.unit_id[0] || false,
        }
        console.log('oldObj', oldObj);
        const newObj = {
            name, plan, is_active, message_is_follower,
            company_objective_id: company_objective_id?.value || false,
            unit_id: unit_id?.value || false,
        }
        console.log('newObj', newObj);
        const diffInfoObj = compareObjects(oldObj, newObj)
        if (Object.keys(diffInfoObj).length === 0) {
            this.setState({ isEditing: false })
            return
        }


        const json = await write('company.objective.line', [id], diffInfoObj);
        if (json.error) {
            showDialog('', json.error.data.message)
        }
        const json2 = await this.detailInfo(id)
        const data = json2.result[0]

        this.setState({ companyObjectiveLine: data })
        params.set('id', id);
        this.forceUpdate();
        this.setState({ isEditing: false })
        setParams(params);
        showNotification('', json.error.data.message, 'error')
        showDialog('Thông báo', 'Đã sửa thông tin')
    }

    async create() {
        const { name, type, listType, objective_type, listObjectiveType, branch_id, business_unit_id, listBusiness, starting_date,
            ending_date, logActive, error, isEditing, detailInfo, line_ids } = this.state
        const { showNotification, showDialog, create, setLoading, params, setParams } = this.props
        if (!name) {
            showNotification('', 'Vui lòng không để trống Name', 'error')
            return
        }
        if (!starting_date) {
            showNotification('', 'Vui lòng không để trống starting_date', 'error')
            return
        }
        if (!ending_date) {
            showNotification('', 'Vui lòng không để trống ending_date', 'error')
            return
        }
        if (!objective_type) {
            showNotification('', 'Vui lòng không để trống objective_type', 'error')
            return
        }
        if (!type) {
            showNotification('', 'Vui lòng không để trống type', 'error')
            return
        }
        setLoading(true)
        const dataCreate = await create('company.objective', {
            name,
            type: type.value,
            objective_type: objective_type.value,
            starting_date: moment(starting_date).format(DATE_TIME_FORMAT),
            ending_date: moment(ending_date).format(DATE_TIME_FORMAT),
            business_unit_id: business_unit_id?.value || false,
            branch_id: branch_id?.value || false,
        })
        if (dataCreate.error) {
            setLoading(false)
            showDialog('', dataCreate.error.data.message)
            return
        }
        const newData = await this.detailInfo(dataCreate.result)
        const data = newData.result[0]
        this.setState({ companyObjectiveLine: data, line_ids: data.line_ids, isEditing: false })
        params.set('id', dataCreate.result)
        setParams(params)
        this.forceUpdate()
        setLoading(false)
        showNotification('', 'Đã tạo mục tiêu mới', 'success')
    }

    save() {
        const { id } = this.props
        if (!id
        ) {
            this.create()
        } else {
            this.handelSaveEdit()
        }
    }




    async init() {
        const { loadViews, setLoading, id, updateBreadcrumb } = this.props
        setLoading(true)
        this.onTextChangeUnit()
        this.onTextChangeObjective()
        if (id) {
            const [fieldName, detailInfo] = await Promise.all([
                loadViews('company.objective.line', ['form']),
                this.detailInfo(id),
            ]);
            updateBreadcrumb(
                [{
                    name: detailInfo.result[0].company_objective_id[1],
                    path: `${routes.DetailCompanyObjective.path}`,
                    id: detailInfo.result[0].company_objective_id[0],
                    chip: 'Mục tiêu'
                },
                ])
            const label = fieldName.result.fields
            const {
                name,
                is_active,
                message_is_follower,
                plan,
                result,
                company_objective_id,
                unit_id,
                department_ids,
            } = detailInfo.result[0]
            const objective = mapFieldToOption(company_objective_id, 'label')
            const unit = mapFieldToOption(unit_id, 'label')
            this.setState({
                name,
                is_active,
                message_is_follower,
                plan,
                result,
                department_ids,
                company_objective_id: objective,
                unit_id: unit,
                companyObjectiveLine: detailInfo.result[0],
                field_of_view: label,
            })
        }
        else {
            console.log('không làm hàm tạo');
        }
        setLoading(false)
    }

    render() {
        const { name, type, logActive, error, isEditing, detailInfo, listType, department_ids, companyObjectiveLine, company_objective_id, field_of_view,
            is_active, listObjective, listUnit, plan, result, unit_id, message_is_follower
        } = this.state
        const { id, breadcrumb, theme, tabSx, value, handleChange,
            handleChangeIndex, } = this.props
        return (
            <>
                <Helmet>
                    <title>Sổ chi tiết mua hàng</title>
                </Helmet>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                    <HeaderToolbar breadcrumb={breadcrumb} routeName={id ? `${name}` : 'Mới'}
                        buttons={
                            !isEditing
                                ? [
                                    {
                                        text: 'Sửa', onClick: () => {
                                            this.setState({
                                                isEditing: true, detailInfo: true
                                            });
                                        }
                                    },
                                ] :
                                [
                                    { text: 'Lưu', onClick: () => { this.save() } },
                                    { text: 'Hủy', onClick: () => { this.cancel() }, buttonProps: { color: 'error', variant: 'contained' } },
                                ]
                        }

                    />

                    <Grid container spacing={2}>
                        <Grid sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto', padding: '0 8px' }} item xs={12} sm={12} md={logActive ? 9 : 12}>
                            <Stack direction='column' gap='16px'>
                                <Box sx={{
                                    display: 'flex', flexDirection: 'column',
                                    width: '100%', backgroundColor: 'white', borderRadius: '4px', padding: '16px',
                                }}>
                                    <Stack padding='16px' direction='row' justifyContent='space-between' alignItems='flex-start'>
                                        <Stack direction='row' justifyContent='space-between' width='100%' gap='8px'>
                                            <Stack direction='row' gap='4px' width='100%' alignItems='center'>
                                                <Grow in={name}>
                                                    <Typography color='GrayText' variant='h6'>{name}</Typography>
                                                </Grow>
                                                <Tooltip title={detailInfo ? 'Ẩn chi tiết' : 'Chi tiết'}>
                                                    <IconButton onClick={() => { this.setState({ detailInfo: !detailInfo }) }}>
                                                        {detailInfo ? <VisibilityOffIcon sx={{ height: '16px', width: '16px' }} /> : < VisibilityIcon sx={{ height: '16px', width: '16px' }} />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                            <Stack direction='column' gap='8px' alignItems='flex-end' width='100%'>
                                                <Grid item xs={12} md={6} >
                                                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px', }}>
                                                        <Chip minWidth='180px' component={Button} sx={{
                                                            borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, minWidth: '80px',
                                                            backgroundColor: 'rgba(34, 197, 94, 0.16)',
                                                            color: 'rgb(17, 141, 87)'

                                                        }} label={formatterRevenue.format(result)} />
                                                    </Stack>
                                                </Grid>



                                            </Stack>
                                        </Stack>
                                    </Stack>

                                    <Grow unmountOnExit in={detailInfo}>
                                        <Box className='fade-in-effect'
                                            // onSubmit={this.handleSubmit}
                                            component="form"
                                            sx={{ width: '50%', flexDirection: 'column', display: 'flex', padding: '16px  16px', }}
                                            noValidate
                                            autoComplete="off">
                                            <Grid container spacing={4}>
                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('name')}
                                                        <Tooltip title='Đây là trường bắt buộc' >
                                                            <Typography variant='button' color='#d32f2f' >*</Typography>
                                                        </Tooltip>
                                                    </Typography>
                                                    {isEditing ? <TextField
                                                        variant='outlined'
                                                        size="small"
                                                        error={error}
                                                        helperText={error}
                                                        name="name"
                                                        disabled={!isEditing}
                                                        sx={{ width: '100%' }}
                                                        defaultValue={name || ''}
                                                        onBlur={({ target: { value } }) => {
                                                            this.setState({ name: value })
                                                        }}
                                                        required
                                                    /> : <Typography variant='body2'>{name}</Typography>}
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('plan')}
                                                        <Tooltip title='Đây là trường bắt buộc' >
                                                            <Typography variant='button' color='#d32f2f' >*</Typography>
                                                        </Tooltip>
                                                    </Typography>
                                                    {isEditing ? <TextField
                                                        variant='outlined'
                                                        size="small"
                                                        error={error}
                                                        helperText={error}
                                                        name="name"
                                                        disabled={!isEditing}
                                                        sx={{ width: '100%' }}
                                                        defaultValue={plan}
                                                        onBlur={({ target: { value } }) => {
                                                            this.setState({ plan: value })
                                                        }}
                                                        required
                                                    /> : <Typography variant='body2'>{plan}</Typography>}
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('company_objective_id')}
                                                    </Typography>
                                                    {isEditing ? <FormControl sx={{ width: '100%', }}>
                                                        <Autocomplete
                                                            disabled={!isEditing}
                                                            disablePortal
                                                            size="small"
                                                            id="combo-box-demo"
                                                            value={company_objective_id?.text || ''}
                                                            // inputValue={this.state.managerSearch}
                                                            onChange={(event, company_objective_id) => {
                                                                this.setState({ company_objective_id });
                                                            }}
                                                            options={listObjective}
                                                            onInputChange={(event, value) => {
                                                                // this.setState({ managerSearch: value })
                                                                this.debounce(() => { this.onTextChangeObjective(value) }, 500)
                                                            }}
                                                            sx={{ width: '100%' }}
                                                            renderInput={(params) => (
                                                                <TextField variant={!isEditing && 'standard' || 'outlined'}
                                                                    size="small" {...params} />
                                                            )}
                                                        />

                                                    </FormControl> : <Typography variant='body2'>{company_objective_id?.text || ''}</Typography>}
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('unit_id')}
                                                    </Typography>
                                                    {isEditing ? <FormControl sx={{ width: '100%' }}>
                                                        <Autocomplete
                                                            disabled={!isEditing}
                                                            disablePortal
                                                            size="small"
                                                            id="combo-box-demo"
                                                            value={unit_id?.text || ''}
                                                            // inputValue={this.state.managerSearch}
                                                            onChange={(event, unit_id) => {
                                                                this.setState({ unit_id });
                                                            }}
                                                            options={listUnit}
                                                            onInputChange={(event, value) => {
                                                                // this.setState({ managerSearch: value })
                                                                this.debounce(() => { this.onTextChangeUnit(value) }, 500)
                                                            }}
                                                            sx={{ width: '100%' }}
                                                            renderInput={(params) => (
                                                                <TextField variant={!isEditing && 'standard' || 'outlined'}
                                                                    size="small" {...params} />
                                                            )}
                                                        />

                                                    </FormControl> : <Typography variant='body2'>{unit_id?.text || ''}</Typography>}
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <FormControlLabel
                                                        sx={{ justifyContent: 'flex-end', marginLeft: 0 }}
                                                        value={is_active}
                                                        control={<Checkbox
                                                            checked={!!is_active}
                                                            onChange={this.handleChangeActive}
                                                            inputProps={{ 'aria-label': 'controlled' }} />}
                                                        label={<Typography variant='button'>{this.getLabel('is_active')}</Typography>}
                                                        labelPlacement="start"
                                                    />
                                                    <FormControlLabel
                                                        sx={{ justifyContent: 'flex-end', marginLeft: 0 }}
                                                        value={is_active}
                                                        control={<Checkbox
                                                            checked={!!message_is_follower}
                                                            onChange={this.handleChangeFollower}
                                                            inputProps={{ 'aria-label': 'controlled' }} />}
                                                        label={<Typography variant='button'>{this.getLabel('message_is_follower')}</Typography>}
                                                        labelPlacement="start"
                                                    />
                                                </Grid>
                                            </Grid>

                                        </Box>
                                    </Grow>
                                </Box>
                                <Box sx={{
                                    display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh-127px)', boxShadow: '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)',
                                    overflow: 'auto', width: '100%', backgroundColor: 'white', borderRadius: '4px', padding: '16px'
                                }}>
                                    <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        variant="fullWidth"
                                        centered
                                        scrollButtons="auto"
                                        aria-label="scrollable auto tabs example"
                                    >
                                        <Tab sx={tabSx} label="Departments" />
                                    </Tabs>

                                    <SwipeableViews
                                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                        index={value}
                                        onChangeIndex={handleChangeIndex}
                                    >
                                        <TabPanel value={value} index={0} className="detai-project-tab-panel">
                                            <Grid item xs={12} md={12} lg={12}>
                                                <TabDeparment onCreateDeparment={this.handleDataCreationDepartment} id={companyObjectiveLine.id}
                                                    isEditing={isEditing} department_ids={department_ids} model='hr.department' />
                                            </Grid>
                                        </TabPanel>
                                    </SwipeableViews>
                                </Box>

                            </Stack>
                        </Grid>
                    </Grid>



                </Box>
            </>
        )
    }
}

export default function (props) {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery((theme) =>
        theme.breakpoints.between('md', 'lg')
    );
    const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate()
    const { showDialog, setLoading, read, create, unlink, write, loadViews, nameSearch, searchRead, showNotification } = useContext(UserContext);
    const id = parseInt(params.get('id'), 10)
    const user = JSON.parse(localStorage.getItem('userInfo'))
    const tabSx = {
        borderRight: '2px solid rgba(255,255,255,.1)',
        borderRadius: '2px', minWidth: '90px', fontSize: '13px', padding: '6px 8px', minHeight: '36px',
        fontWeight: 500
    }
    const [value, setValue] = useState(0);
    const [breadcrumb, setBreadcrumb] = useState([{ name: 'Mục tiêu công ty', path: routes.companyObjective.path }])

    const handleChange = (event, tabIndex) => {
        setValue(tabIndex);
        localStorage.setItem('activeTab', tabIndex);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
        localStorage.setItem('activeTab', index);
    };

    const updateBreadcrumb = (value = []) => {
        const newBreadcrumb = [...breadcrumb, ...value];
        setBreadcrumb(newBreadcrumb);
        // console.log('breadcrumb', breadcrumb);
    }





    // Tạo một giá trị mới cho thuộc tính `id`
    // const newId = rows.length + 1

    return <DetailObjectiveLine {...props} {...{
        read, params, setParams, showDialog, navigate, loadViews, theme, tabSx, value, setValue,
        setLoading, id, create, unlink, write, nameSearch, handleChange,
        handleChangeIndex, searchRead, user, breadcrumb, updateBreadcrumb, showNotification, isSmallScreen, isLargeScreen, isMediumScreen
    }} />;
}