import { Autocomplete, Backdrop, Box, Button, Checkbox, Chip, Fade, FormControl, FormControlLabel, FormHelperText, Grid, Grow, IconButton, MenuItem, Modal, Select, Stack, Tab, Tabs, TextField, Tooltip, Typography, alpha, styled, useTheme } from '@mui/material';
import moment from 'moment';
import React, { Component, useContext, useMemo, useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, compareObjects, formatterRevenue, getFieldSelection, mapFieldToOption, routes } from 'src/global';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Container, TabPanel } from 'src/components/tab-panel/Wrapper';
import SwipeableViews from 'react-swipeable-views';
import TabLines from 'src/components/company-objective/TabLines';
import { viVN } from '@mui/x-data-grid/locales';
import { DataGrid, gridClasses } from '@mui/x-data-grid';


const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: '#EBEFFF',
        '&:hover, &.Mui-hovered': {
            backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            },
        },
        '&.Mui-selected': {
            backgroundColor: alpha(
                theme.palette.primary.main,
                ODD_OPACITY + theme.palette.action.selectedOpacity,
            ),
            '&:hover, &.Mui-hovered': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    ODD_OPACITY +
                    theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity,
                ),
                // Reset on touch devices, it doesn't add specificity
                '@media (hover: none)': {
                    backgroundColor: alpha(
                        theme.palette.primary.main,
                        ODD_OPACITY + theme.palette.action.selectedOpacity,
                    ),
                },
            },
        },
    },
}));

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    borderRadius: '12px',
    padding: '24px',
    width: '80%',
    maxHeight: '90vh',
    overflow: 'auto'
}

class CompanyObjecyiveDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            field_of_view: {},
            name: '',
            type: { text: '', value: '' },
            listType: [],
            // objective_type: { text: '', value: '' },
            // listObjectiveType: [],
            branch_id: {},
            listBranch: [],
            business_unit_id: {},
            listBusiness: [],
            starting_date: null,
            ending_date: null,
            line_ids: [],
            is_verified: false,
            companyObjective: {},
            isEditing: false,
            logActive: false,
            error: false,
            detailInfo: false,
            open: false,
            crud: {}
        };
    }



    componentDidMount() {
        this.init();
        this.checkShowDetail();
    }

    async onTextChangeBusiness(value = '') {
        const { nameSearch } = this.props
        const json = await nameSearch('business.unit', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        this.setState({ listBusiness: result })
    }

    async onTextChangeBranch(value = '') {
        const { nameSearch } = this.props
        const json = await nameSearch('res.company.modify', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        this.setState({ listBranch: result })
    }

    // getPreviousMonthRange(startDate, endDate) {
    //     // Chuyển đối tượng Date thành đối tượng Moment để dễ dàng thao tác
    //     const start = moment(startDate);
    //     const end = moment(endDate);

    //     // Trừ đi 1 tháng từ ngày bắt đầu và ngày kết thúc
    //     const prevStart = start.clone().subtract(1, 'month').startOf('month');
    //     const prevEnd = end.clone().subtract(1, 'month').endOf('month').set({ hour: 23, minute: 59, second: 59 });

    //     return {
    //         beforeStartDate: prevStart.toDate(),
    //         beforeEndDate: prevEnd.toDate(),
    //     };
    // }

    getLabel = (fieldName) => (this.state.field_of_view[fieldName] && this.state.field_of_view[fieldName].string || fieldName);

    handleChangeActive = (event) => {
        const { is_verified } = this.state
        console.log('event', event);
        this.setState({ isEditing: true, is_verified: !is_verified })
    };

    checkShowDetail = () => {
        const { asComponent, id } = this.props
        if (asComponent || !id) {
            this.setState({ detailInfo: true })
            return
        }

        this.setState({ detailInfo: false })
    }

    handleClose = () => {
        this.setState({ open: false });
    };

    async detailInfo(id = '') {
        const { read } = this.props
        const json = await read('company.objective', [id], ['name', 'type', 'business_unit_id', 'branch_id', 'is_verified', 'starting_date',
            'ending_date', 'line_ids'
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
            const { companyObjective } = this.state
            const { loadViews } = this.props
            const json = await loadViews('company.objective', ['form'])
            const label = json.result.fields;
            const listTypes = getFieldSelection(label, 'type')
            // const listObjective = getFieldSelection(label, 'objective_type')
            const types = listTypes.find((x) => x.value === companyObjective.type)
            // const objective = listObjective.find((x) => x.value === companyObjective.objective_type)

            const business = mapFieldToOption(companyObjective.business_unit_id, 'label')
            const branch = mapFieldToOption(companyObjective.branch_id, 'label')
            this.setState({
                name: companyObjective.name,
                is_verified: companyObjective.is_verified,
                type: types,
                listType: listTypes,
                // objective_type: objective,
                // listObjectiveType: listObjective,
                business_unit_id: business,
                branch_id: branch,
                starting_date: moment(companyObjective.starting_date).isValid ? moment(companyObjective.starting_date) : null,
                ending_date: moment(companyObjective.ending_date).isValid ? moment(companyObjective.ending_date) : null,
                detailInfo: false,
                isEditing: false
            })
        }
    }

    async handelSaveEdit() {
        const { params, setParams, write, showDialog, id, showNotification } = this.props
        const { companyObjective, name, starting_date, ending_date, business_unit_id, branch_id, type, is_verified } = this.state

        const oldObj = {
            name: companyObjective.name,
            starting_date: companyObjective.starting_date || false,
            ending_date: companyObjective.ending_date || false,
            business_unit_id: companyObjective?.business_unit_id || false,
            branch_id: companyObjective?.branch_id || false,
            type: companyObjective?.type || false,
            is_verified: companyObjective.is_verified
        }

        console.log('companyObjective', companyObjective);

        const newObj = {
            name,
            starting_date: moment(starting_date).format(DATE_TIME_FORMAT),
            ending_date: moment(ending_date).format(DATE_TIME_FORMAT),
            business_unit_id: business_unit_id?.value || false,
            branch_id: branch_id?.value || false,
            is_verified,
            type: type?.value || false,
        }
        const diffInfoObj = compareObjects(oldObj, newObj)
        if (Object.keys(diffInfoObj).length === 0) {
            this.setState({ isEditing: false })
            return
        }


        const json = await write('company.objective', [id], diffInfoObj);
        if (json.error) {
            showDialog('', json.error.data.message)
        }
        const json2 = await this.detailInfo(id)
        const data = json2.result[0]
        this.setState({ companyObjective: data })
        params.set('id', id);
        this.forceUpdate();
        this.setState({ isEditing: false })
        setParams(params);
        showNotification('', json.error.data.message, 'error')
        showDialog('Thông báo', 'Đã sửa thông tin mục tiêu')
    }

    async create() {
        const { name, type, listType, branch_id, business_unit_id, listBusiness, starting_date,
            ending_date, logActive, error, isEditing, detailInfo, line_ids, is_verified } = this.state
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
        if (!type) {
            showNotification('', 'Vui lòng không để trống type', 'error')
            return
        }
        setLoading(true)
        const dataCreate = await create('company.objective', {
            name,
            is_verified,
            type: type.value,
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
        this.setState({ companyObjective: data, line_ids: data.line_ids, isEditing: false })
        params.set('id', dataCreate.result)
        setParams(params)
        this.forceUpdate()
        setLoading(false)
        showNotification('', 'Đã tạo mục tiêu mới', 'success')
    }

    // async viewResult() {
    //     const { objective_type, business_unit_id, branch_id, starting_date, ending_date } = this.state
    //     const { getControlIndexFilter, getRevenuesFilter, getSellingExpensessFilter, getManagementExpensesFilter, setLoading, setData } = this.props
    //     const { beforeStartDate, beforeEndDate } = this.getPreviousMonthRange(starting_date, ending_date)
    //     setLoading(true)
    //     if (objective_type.value === 'control_index') {
    //         const [current, before] = await Promise.all([
    //             getControlIndexFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
    //             getControlIndexFilter(branch_id?.value || false, business_unit_id?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),
    //         ])
    //         const result = current.result.map(obj => {
    //             const beforeObj = before.result.find(item => item.code === obj.code);
    //             return {
    //                 ...obj,
    //                 before: beforeObj ? beforeObj.value : 0
    //             };
    //         });
    //         setData(result)
    //         console.log('result', result);
    //         this.setState({ open: true })
    //         setLoading(false)
    //     }

    //     if (objective_type.value === 'revenue') {
    //         const [current, before] = await Promise.all([
    //             getRevenuesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
    //             getRevenuesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),

    //         ])
    //         const result = current.result.map(obj => {
    //             const beforeObj = before.result.find(item => item.code === obj.code);
    //             return {
    //                 ...obj,
    //                 before: beforeObj ? beforeObj.value : 0
    //             };
    //         });
    //         setData(result)
    //         console.log('result', result);
    //         this.setState({ open: true })
    //         setLoading(false)
    //     }

    //     if (objective_type.value === 'selling_expenses') {
    //         const [current, before] = await Promise.all([
    //             getSellingExpensessFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
    //             getSellingExpensessFilter(branch_id?.value || false, business_unit_id?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT))
    //         ])
    //         const result = current.result.map(obj => {
    //             const beforeObj = before.result.find(item => item.code === obj.code);
    //             return {
    //                 ...obj,
    //                 before: beforeObj ? beforeObj.value : 0
    //             };
    //         });
    //         setData(result)
    //         console.log('result', result);
    //         this.setState({ open: true })
    //         setLoading(false)
    //     }

    //     if (objective_type.value === 'budget_management') {
    //         const [current, before] = await Promise.all([
    //             getManagementExpensesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
    //             getManagementExpensesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),
    //         ])
    //         const result = current.result.map(obj => {
    //             const beforeObj = before.result.find(item => item.code === obj.code);
    //             return {
    //                 ...obj,
    //                 before: beforeObj ? beforeObj.value : 0
    //             };
    //         });
    //         setData(result)
    //         console.log('result', result);
    //         this.setState({ open: true })
    //         setLoading(false)
    //     }

    //     if (objective_type.value === 'ratio_management') {
    //         const [current, before] = await Promise.all([
    //             getManagementExpensesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
    //             getManagementExpensesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),
    //         ])
    //         const result = current.result.map(obj => {
    //             const beforeObj = before.result.find(item => item.code === obj.code);
    //             return {
    //                 ...obj,
    //                 before: beforeObj ? beforeObj.value : 0
    //             };
    //         });
    //         setData(result)
    //         console.log('result', result);
    //         this.setState({ open: true })
    //         setLoading(false)
    //     }

    // }

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
        const { loadViews, params, setLoading, user, searchRead, showDialog, id, psms, accessRights } = this.props
        setLoading(true)
        console.log('chạy vào đây');
        this.onTextChangeBusiness()
        this.onTextChangeBranch()
        if (id) {
            if (!psms.includes('company.objective')) {
                console.log('thêm');
                psms.push('company.objective');
            }
            const modelCurrent = await JSON.stringify(psms);
            await localStorage.setItem('psm', modelCurrent)
            const access = await accessRights()
            const permissions = await psms.filter((key) => Object.prototype.hasOwnProperty.call(access.result, key))
                .map((key) => ({
                    name: key,
                    ...access.result[key]
                }))
            const currentPes = await permissions.filter(x => x.name === 'company.objective')
            await this.setState(prevState => ({
                crud: currentPes, ...prevState.crud
            }))
            const [fieldName, detailInfo] = await Promise.all([
                loadViews('company.objective', ['form']),
                this.detailInfo(id),
            ]);
            const label = fieldName.result.fields
            const {
                name,
                starting_date,
                ending_date,
                type,
                // objective_type,
                business_unit_id,
                branch_id,
                is_verified,
                line_ids,
            } = detailInfo.result[0]
            const listTypes = getFieldSelection(label, 'type')
            // const listObjective = getFieldSelection(label, 'objective_type')
            const types = listTypes.find((x) => x.value === type)
            // const objective = listObjective.find((x) => x.value === objective_type)
            const business = mapFieldToOption(business_unit_id, 'label')
            const branch = mapFieldToOption(branch_id, 'label')
            this.setState({
                name,
                starting_date: moment(starting_date).isValid ? moment(starting_date) : null,
                ending_date: moment(ending_date).isValid ? moment(ending_date) : null,
                type: types,
                listType: listTypes,
                // objective_type: objective,
                // listObjectiveType: listObjective,
                business_unit_id: business,
                branch_id: branch,
                is_verified,
                line_ids,
                companyObjective: detailInfo.result[0],
                field_of_view: label,
            })

        }
        else {
            const json = await loadViews('company.objective', ['form'])
            const label = json.result.fields;
            const listTypes = getFieldSelection(label, 'type')
            // const listObjective = getFieldSelection(label, 'objective_type')
            const types = listTypes.find((x) => x.value === 'monthly')
            // const objective = listObjective.find((x) => x.value === 'control_index')
            this.setState({
                listType: listTypes,
                // listObjectiveType: listObjective,
                type: types,
                // objective_type: objective,
                field_of_view: label,
                isEditing: true,
            })
        }
        setLoading(false)
    }

    render() {
        const { name, type, listType, branch_id, listBranch, business_unit_id, listBusiness, starting_date,
            ending_date, line_ids, companyObjective, logActive, error, isEditing, detailInfo, open, is_verified, crud
        } = this.state


        const { id, breadcrumb, tabSx, handleChange, value, handleChangeIndex, theme, columns, dataMemo } = this.props
        return (
            <>
                <Helmet>
                    <title>Sổ chi tiết mua hàng</title>
                </Helmet>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                    <HeaderToolbar breadcrumb={breadcrumb} routeName={id ? `${name}` : 'Mới'}
                        buttons={

                            crud[0]?.write || crud[0]?.create || true ?
                                !isEditing ? [
                                    {
                                        text: 'Sửa', onClick: () => {
                                            this.setState({
                                                isEditing: true, detailInfo: true
                                            });
                                        }
                                    },
                                    // {
                                    //     text: 'Xem kết quả', onClick: () => { this.viewResult() }, buttonProps: { color: 'success', variant: 'contained' }
                                    // },
                                ] :
                                    [
                                        { text: 'Lưu', onClick: () => { this.save() } },
                                        { text: 'Hủy', onClick: () => { this.cancel() }, buttonProps: { color: 'error', variant: 'contained' } },
                                    ]
                                : []
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
                                            {/* <Stack direction='column' gap='8px' alignItems='flex-end' width='100%'>
                                                <Grid item xs={12} md={6} >
                                                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px', }}>
                                                        {isEditing ?
                                                            <>
                                                                <Typography sx={{ fontWeight: 600, fontSize: 15 }} variant={'button'}>
                                                                    {this.getLabel('objective_type')}</Typography>
                                                                <FormControl required fullWidth>
                                                                    <Select required
                                                                        sx={{ width: '20ch' }}
                                                                        variant={!isEditing && 'standard' || 'outlined'}
                                                                        labelId="demo-simple-select-label"
                                                                        id="demo-simple-select"
                                                                        size="small"
                                                                        value={objective_type.text}
                                                                        renderValue={(p) => p}
                                                                        onChange={({ target: { value: objective_type } }) => {
                                                                            this.setState({ objective_type });
                                                                            // this.handelUpdateState(projectType)
                                                                        }}
                                                                    >
                                                                        {listObjectiveType.map((option) => (
                                                                            <MenuItem key={option.value} value={option}>
                                                                                {option.text}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </>
                                                            :
                                                            <Chip minWidth='180px' component={Button} sx={{
                                                                borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, minWidth: '80px',
                                                                backgroundColor: 'rgba(34, 197, 94, 0.16)',
                                                                color: 'rgb(17, 141, 87)'

                                                            }} label={objective_type?.text || ''} />
                                                        }
                                                    </Stack>
                                                </Grid> 
                                            </Stack> */}
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
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('starting_date')}
                                                        <Tooltip title='Đây là trường bắt buộc'>
                                                            <Typography variant='button' color='#d32f2f' >*</Typography>
                                                        </Tooltip>
                                                    </Typography>
                                                    <Box sx={{ width: '100%' }}>
                                                        {isEditing ? <FormControl required sx={{ width: '100%' }}>
                                                            <DateTimePicker
                                                                className='objective-custom-template'
                                                                size="small"
                                                                variant='standard'
                                                                disabled={!isEditing}
                                                                format={DATE_FORMAT_TO_DISPLAY}
                                                                onChange={(date) => { this.setState({ starting_date: date }) }}
                                                                value={starting_date}
                                                            />
                                                            {!!error && <FormHelperText>
                                                                <Typography sx={{ color: 'red', fontSize: 11, paddingLeft: '10px' }}>Vui lòng chọn thời gian</Typography>
                                                            </FormHelperText>}
                                                        </FormControl> : <Typography variant='body2'>{moment(starting_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography>}

                                                    </Box>
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('type')}
                                                        <Tooltip title='Đây là trường bắt buộc'>
                                                            <Typography variant='button' color='#d32f2f' >*</Typography>
                                                        </Tooltip>
                                                    </Typography>


                                                    {isEditing ? <FormControl required sx={{ width: '100%' }}>
                                                        <Select required
                                                            variant={!isEditing && 'standard' || 'outlined'}
                                                            error={!!error}
                                                            disabled={!isEditing}
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            size="small"
                                                            value={type.text || ''}
                                                            renderValue={(p) => p}
                                                            onChange={({ target: { value: type } }) => {
                                                                this.setState({ type });
                                                            }}
                                                        >
                                                            {listType.map((option) => (
                                                                <MenuItem key={option.value} value={option}>
                                                                    {option.text}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {!!error && <FormHelperText>
                                                            <Typography sx={{ color: 'red', fontSize: 11, paddingLeft: '10px' }}>Vui lòng chọn loại mục tiêu</Typography>
                                                        </FormHelperText>}
                                                    </FormControl> : <Typography variant='body2'>{type?.text || ''}</Typography>}

                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('ending_date')}
                                                        <Tooltip title='Đây là trường bắt buộc'>
                                                            <Typography variant='button' color='#d32f2f' >*</Typography>
                                                        </Tooltip>
                                                    </Typography>
                                                    <Box sx={{ width: '100%' }}>
                                                        {isEditing ? <FormControl required sx={{ width: '100%' }}>
                                                            <DateTimePicker
                                                                className='objective-custom-template'
                                                                size="small"
                                                                variant='standard'
                                                                disabled={!isEditing}
                                                                format={DATE_FORMAT_TO_DISPLAY}
                                                                onChange={(date) => { this.setState({ ending_date: date }) }}
                                                                value={ending_date}
                                                            />
                                                            {!!error && <FormHelperText>
                                                                <Typography sx={{ color: 'red', fontSize: 11, paddingLeft: '10px' }}>Vui lòng chọn thời gian</Typography>
                                                            </FormHelperText>}
                                                        </FormControl> : <Typography variant='body2'>{moment(ending_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography>}

                                                    </Box>
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('business_unit_id')}
                                                    </Typography>
                                                    {isEditing ? <FormControl sx={{ width: '100%' }}>
                                                        <Autocomplete
                                                            disabled={!isEditing}
                                                            disablePortal
                                                            size="small"
                                                            id="combo-box-demo"
                                                            value={business_unit_id?.text || ''}
                                                            // inputValue={this.state.managerSearch}
                                                            onChange={(event, business_unit_id) => {
                                                                this.setState({ business_unit_id });
                                                            }}
                                                            options={listBusiness}
                                                            onInputChange={(event, value) => {
                                                                // this.setState({ managerSearch: value })
                                                                this.debounce(() => { this.onTextChangeBusiness(value) }, 500)
                                                            }}
                                                            sx={{ width: '100%' }}
                                                            renderInput={(params) => (
                                                                <TextField variant={!isEditing && 'standard' || 'outlined'}
                                                                    size="small" {...params} />
                                                            )}
                                                        />

                                                    </FormControl> : <Typography variant='body2'>{business_unit_id?.text || ''}</Typography>}
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('branch_id')}
                                                    </Typography>
                                                    {isEditing ? <FormControl sx={{ width: '100%', }}>
                                                        <Autocomplete
                                                            disabled={!isEditing}
                                                            disablePortal
                                                            size="small"
                                                            id="combo-box-demo"
                                                            value={branch_id?.text || ''}
                                                            // inputValue={this.state.managerSearch}
                                                            onChange={(event, branch_id) => {
                                                                this.setState({ branch_id });
                                                            }}
                                                            options={listBranch}
                                                            onInputChange={(event, value) => {
                                                                // this.setState({ managerSearch: value })
                                                                this.debounce(() => { this.onTextChangeBusiness(value) }, 500)
                                                            }}
                                                            sx={{ width: '100%' }}
                                                            renderInput={(params) => (
                                                                <TextField variant={!isEditing && 'standard' || 'outlined'}
                                                                    size="small" {...params} />
                                                            )}
                                                        />

                                                    </FormControl> : <Typography variant='body2'>{branch_id?.text || ''}</Typography>}
                                                </Grid>

                                                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={6}>
                                                    <FormControlLabel
                                                        sx={{ justifyContent: 'flex-end', marginLeft: 0 }}
                                                        value={is_verified}
                                                        control={<Checkbox
                                                            disabled={crud?.write || false}
                                                            checked={!!is_verified}
                                                            onChange={this.handleChangeActive}
                                                            inputProps={{ 'aria-label': 'controlled' }} />}
                                                        label={<Typography variant='button'>{this.getLabel('Đã được xác minh')}</Typography>}
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
                                    <TabLines
                                        starting={starting_date}
                                        ending={ending_date}
                                        branch={branch_id}
                                        business={business_unit_id}
                                        id={id}
                                        name='Chi tiết'
                                        model='company.objective.line'
                                        line_ids={line_ids}
                                    />
                                </Box>

                            </Stack>
                        </Grid>
                    </Grid>

                </Box>

                <Modal aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={open}
                    onClose={this.handleClose}
                    closeAfterTransition
                    slots={{ backdrop: Backdrop }}
                    slotprops={{
                        backdrop: {
                            timeout: 500,
                        },
                    }}>
                    <Fade in={open}>
                        <Box sx={style}>
                            <StripedDataGrid
                                sx={{
                                    [`& .${gridClasses.cell}`]: {
                                        py: 1
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        textOverflow: "clip",
                                        whiteSpace: "break-spaces",
                                        lineHeight: 1
                                    }, border: 0
                                }}
                                getRowHeight={() => 'auto'}
                                className="custom-dataGrid"
                                rows={dataMemo}
                                columns={columns}
                                pageSize={10}
                                autoHeight {...dataMemo}
                                hideFooter
                                initialState={{
                                    ...dataMemo.initialState,
                                    pagination: { paginationModel: { pageSize: 100 } },
                                }}
                                localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                                getRowClassName={(params) =>
                                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                                }
                            />
                        </Box>
                    </Fade>
                </Modal>

            </>
        )
    }
}

export default function (props) {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const { showDialog, setLoading, read, create, unlink, write, loadViews, nameSearch, searchRead,
        showNotification, getControlIndexFilter, getRevenuesFilter, getSellingExpensessFilter, getManagementExpensesFilter, psms, accessRights } = useContext(UserContext);
    const id = parseInt(params.get('id'), 10)
    const theme = useTheme();
    const user = JSON.parse(localStorage.getItem('userInfo'))
    const tabSx = {
        borderRight: '2px solid rgba(255,255,255,.1)',
        borderRadius: '2px', minWidth: '90px', fontSize: '13px', padding: '6px 8px', minHeight: '36px',
        fontWeight: 500
    }
    const [value, setValue] = useState(0);
    const [breadcrumb] = useState([{ name: 'Mục tiêu công ty', path: routes.companyObjective.path }])

    const handleChange = (event, tabIndex) => {
        setValue(tabIndex);
        localStorage.setItem('activeTab', tabIndex);
    };
    const handleChangeIndex = (index) => {
        setValue(index);
        localStorage.setItem('activeTab', index);
    };

    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'name', headerName: 'Chi tiêu', flex: 1, align: 'left', headerAlign: 'left'
        },

        {
            field: 'code', headerName: 'Mã số', align: 'right', headerAlign: 'right',

        },

        {
            field: 'description',
            headerName: 'Thuyết minh',
            align: 'right', headerAlign: 'right',
            renderCell: (params) =>
                params?.row?.description || '',
        },

        {
            field: 'value',
            headerName: 'Số cuối kỳ',
            align: 'right', headerAlign: 'right',
            renderCell: (params) =>
                formatterRevenue.format(params?.row?.value || 0),
        },



        {
            field: 'before', headerName: 'Số đầu kỳ', align: 'right', headerAlign: 'right',
            renderCell: (params) =>
                formatterRevenue.format(params?.row?.before || 0),


        },

    ]
    const dataMemo = useMemo(() => data.map((x, index) => ({ id: index, ...x })), [data])


    // Tạo một giá trị mới cho thuộc tính `id`
    // const newId = rows.length + 1

    return <CompanyObjecyiveDetail {...props} {...{
        read, params, setParams, showDialog, navigate, loadViews, theme, tabSx, value, setValue,
        setLoading, id, create, unlink, write, nameSearch, handleChange, getControlIndexFilter,
        handleChangeIndex, searchRead, user, breadcrumb, showNotification, getRevenuesFilter,
        getSellingExpensessFilter, getManagementExpensesFilter, columns, setData, dataMemo, psms,
        accessRights
    }} />;
}