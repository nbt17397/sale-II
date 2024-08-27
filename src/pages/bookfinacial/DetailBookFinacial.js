import React, { Component, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Autocomplete, Box, FormControl, FormHelperText, Grid, Grow, IconButton, Skeleton, Stack, Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, compareObjects, formatterRevenue, mapFieldToOption, routes } from 'src/global';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar';
import moment from 'moment';
import { DateTimePicker } from '@mui/x-date-pickers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { Container, TabPanel } from 'src/components/tab-panel/Wrapper';
import SwipeableViews from 'react-swipeable-views';
import './BookFinacial.css'
import TabPurchaseLine from 'src/components/detail-book-finacial/TabPurchaseLine';

const CustomToolbar = ({ name, setName }) => (null);

class DetailBookFinacial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            starting_date: null,
            ending_date: null,
            branch_id: {},
            listBranch: [],
            total_price: 0,
            isEditing: false,
            field_of_view: {},
            purchaseReport: {},
            error: '',
            logActive: false,
            detailInfo: false,

        }
    }

    componentDidMount() {
        this.init();
        this.checkShowDetail();
    }

    async handleDelete(id) {
        const result = await this.props.unlink('account.purchase.report', [id])
        if (result.error) {
            this.props.showDialog('', result.error.data.message)
            return
        }
        this.props.navigate({ pathname: routes.bookFinancial.path });
    }

    async onTextChangeBranch(value = '') {
        const { nameSearch } = this.props
        const json = await nameSearch('res.company.modify', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        this.setState({ listBranch: result })
    }

    getLabel = (fieldName) => (this.state.field_of_view[fieldName] && this.state.field_of_view[fieldName].string || fieldName);

    handleDataCreationLine = (newId) => {
        this.setState({ line_ids: newId });
    };

    handleDataEditing = () => {
        this.setState({ isEditing: true });
    };


    checkShowDetail = () => {
        const { asComponent, id, isMobile } = this.props
        if (isMobile || asComponent || !id) {
            this.setState({ detailInfo: true })
            return
        }

        this.setState({ detailInfo: false })
    }

    async purchaseInfo(id = '') {
        // console.log('id', id);
        const { read } = this.props
        const json = await read('account.purchase.report', [id], ["name", "branch_id", "line_ids",
            "total_price", "starting_date", "ending_date"])
        return json
    }

    debounce(fn, ms) {
        clearTimeout(this.timer)
        this.timer = setTimeout(fn, ms);
    }

    async create() {
        const { name, starting_date, ending_date, branch_id } = this.state;
        const { showDialog, setLoading, create, params, setParams, showNotification } = this.props
        // Kiểm tra các trường có rỗng hay không
        if (!name || !starting_date || !ending_date || !branch_id) {
            // Hiển thị thông báo lỗi
            this.setState({ error: 'Đây là trường bắt buộc' })
            return;
        }
        // Nếu các trường không rỗng thì gọi API
        setLoading(true)
        const dataCreate = await create('account.purchase.report', {
            name,
            starting_date: moment(starting_date).format(DATE_TIME_FORMAT),
            ending_date: moment(ending_date).format(DATE_TIME_FORMAT),
            branch_id: branch_id.value,
        });
        console.log('dataCreate', dataCreate);

        if (dataCreate.error) {
            setLoading(false)
            showDialog('Lỗi tạo dữ liệu mới', dataCreate.error.data.message)
            return
        }
        const json2 = await this.purchaseInfo(dataCreate.result)
        const data = json2.result[0]
        this.setState({ purchaseReport: data, isEditing: false, error: '', })
        params.set('id', dataCreate.result)
        setParams(params)
        showNotification('', 'Đã tạo dữ liệu mới', 'success')
        this.forceUpdate();
        setLoading(false)
    }




    async handelSaveEdit() {
        const { write, showNotification, id, showDialog } = this.props
        const oldData = this.state.purchaseReport
        const oldObj = {
            name: oldData.name,
            branch_id: oldData.branch_id[0] || false,
            starting_date: oldData.starting_date || false,
            ending_date: oldData.ending_date || false,
            line_ids: oldData.line_ids || false
        }

        const newObj = {
            name: this.state.name,
            branch_id: this.state.branch_id?.value || false,
            starting_date: moment(this.state.starting_date).format(DATE_TIME_FORMAT),
            ending_date: moment(this.state.ending_date).format(DATE_TIME_FORMAT),
            line_ids: this.state.line_ids || false
        }

        const diffInfoObj = compareObjects(oldObj, newObj)
        console.log('oldObj', oldObj);
        console.log('newObj', newObj);
        console.log('diffInfoObj', diffInfoObj);
        // console.log('leght', Object.keys(diffInfoObj).length);
        if (Object.keys(diffInfoObj).length === 0) {
            this.setState({ isEditing: false })
            return
        }

        const json = await write('account.purchase.report', [id], diffInfoObj);
        if (json.error) {
            showDialog('', json.error.data.message)
            return
        }

        const json2 = await this.purchaseInfo(oldData.id)
        const data = json2.result[0]
        this.setState({ purchaseReport: data })
        console.log('data', data);
        this.forceUpdate();
        this.setState({ isEditing: false })
        showNotification('', 'Đã cập nhật dữ liệu', 'success')

    }

    save() {
        const { id } = this.props
        if (!id) {
            this.create()
        } else {
            this.handelSaveEdit()
        }
    }

    async cancel() {
        const { navigate, id, loadViews } = this.props
        if (!id) {
            navigate({ pathname: routes.bookFinancial.path })
        } else {
            const { purchaseReport } = this.state
            const branch = mapFieldToOption(purchaseReport.branch_id, 'label')
            this.setState({
                name: purchaseReport.name,
                starting_date: moment(purchaseReport.starting_date).isValid ? moment(purchaseReport.starting_date) : null,
                ending_date: moment(purchaseReport.ending_date).isValid ? moment(purchaseReport.ending_date) : null,
                branch_id: branch,
                line_ids: purchaseReport.line_ids,
                total_price: purchaseReport.total_price,
                isEditing: false,
                detailInfo: false
            })
        }
    }

    async init() {
        this.onTextChangeBranch()
        const { loadViews, params, setLoading, user, searchRead, showDialog,
            showNotification, id } = this.props
        setLoading(true)
        if (id) {
            const [fieldName, purchaseInfo] = await Promise.all([
                loadViews('account.purchase.report', ['form']),
                this.purchaseInfo(id),
            ]);
            const label = fieldName.result.fields
            const {
                name,
                branch_id,
                line_ids,
                total_price,
                starting_date,
                ending_date,
            } = purchaseInfo.result[0]
            const branch = mapFieldToOption(branch_id, 'label')
            this.setState({
                name,
                line_ids,
                total_price,
                branch_id: branch,
                field_of_view: label,
                starting_date: moment(starting_date).isValid ? moment(starting_date).add(7, 'hours') : null,
                ending_date: moment(ending_date).isValid ? moment(ending_date).add(7, 'hours') : null,
                purchaseReport: purchaseInfo.result[0]
            })
        } else {
            const json = await loadViews('account.purchase.report', ['form'])
            const fieldName = json.result.fields;
            this.setState({
                field_of_view: fieldName,
                isEditing: true,
            })
        }
        setLoading(false)


    }

    render() {
        const { params, breadcrumb, loading, showDialog, setParams,
            isMobile, id, theme, value, tabSx, handleChange, handleChangeIndex
        } = this.props
        const { name, starting_date, ending_date, branch_id, isEditing, line_ids,
            total_price, listBranch, error, logActive, detailInfo } = this.state
        return (
            <>
                <Helmet>
                    <title>{params.get('id') ? 'Chi tiết sổ mua hàng' : 'Tạo mới dữ liệu'}</title>
                </Helmet>
                {
                    loading ?
                        <Box display='flex' flexDirection='column' gap='16px' width={'100vw'}>
                            <Skeleton sx={{ height: 190 }} width='100%' animation="wave" variant="rectangular" />
                            <Skeleton animation="wave" width='100%' height={40} />
                            <Skeleton animation="wave" width='80%' height={40} />
                        </Box> : <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                            <HeaderToolbar breadcrumb={breadcrumb} routeName={id ? `${name}` : 'Mới'}
                                buttons={
                                    !isEditing
                                        ? [
                                            { text: 'Sửa', onClick: () => { this.setState({ isEditing: true, detailInfo: true }); } },
                                        ] :
                                        [
                                            { text: 'Lưu', onClick: () => { this.save(); } },
                                            { text: 'Hủy', onClick: () => { this.cancel(); }, buttonProps: { color: 'error', variant: 'contained' } },
                                        ]
                                }
                                actions={
                                    !isEditing && this.props.params.get('id')
                                        ? [
                                            {
                                                text: 'Xóa',
                                                onClick: () => {
                                                    showDialog(` Xóa ${name}`, 'Bạn có muốn xóa thông tin ?', [
                                                        {
                                                            text: 'Xác nhận',
                                                            onClick: () => {
                                                                this.handleDelete(this.props.id);
                                                                setParams(this.props.params);
                                                            },
                                                            buttonProps: { variant: 'contained' },
                                                        },
                                                        {
                                                            text: 'Hủy',
                                                            onClick: () => { },
                                                            buttonProps: { color: 'error', variant: 'contained' },
                                                        },
                                                    ]);
                                                },
                                            },
                                        ]
                                        : []
                                }
                            />

                            <Grid container spacing={2}>
                                <Grid sx={{ maxHeight: isMobile ? '100vh' : 'calc(100vh - 250px)', overflow: isMobile ? '' : 'auto', padding: '0 8px' }} item xs={12} sm={12} md={logActive ? 9 : 12}>
                                    <Stack direction='column' gap='16px'>
                                        <Box sx={{
                                            display: 'flex', flexDirection: 'column',
                                            width: '100%', backgroundColor: 'white', borderRadius: '4px', padding: '16px',
                                        }}>

                                            <Stack direction='row' gap='4px' alignItems='center'>

                                                <Stack direction='row' gap='4px' alignItems='center'>
                                                    <Grow in={name}>
                                                        <Typography color='GrayText' variant='h6'>{name}</Typography>
                                                    </Grow>
                                                </Stack>

                                                <Tooltip title={detailInfo ? 'Ẩn chi tiết' : 'Hiện chi tiết'}>
                                                    <IconButton onClick={() => { this.setState({ detailInfo: !detailInfo }) }}>
                                                        {detailInfo ? <VisibilityOffIcon sx={{ height: '16px', width: '16px' }} /> : < VisibilityIcon sx={{ height: '16px', width: '16px' }} />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>

                                            <Grow unmountOnExit in={detailInfo}>
                                                <Box className='fade-in-effect'
                                                    // onSubmit={this.handleSubmit}
                                                    component="form"
                                                    sx={{ width: '75%', flexDirection: 'column', display: 'flex', padding: '16px  16px', }}
                                                    noValidate
                                                    autoComplete="off">
                                                    <Grid container spacing={4}>
                                                        <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={4}>
                                                            <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('Tên')}
                                                                <Tooltip title='Đây là trường bắt buộc' >
                                                                    <Typography variant='button' color='#d32f2f' >*</Typography>
                                                                </Tooltip>
                                                            </Typography>
                                                            {isEditing ? <TextField
                                                                variant='standard'
                                                                size="small"
                                                                error={!!error}
                                                                helperText={error}
                                                                name="name"
                                                                disabled={!isEditing}
                                                                defaultValue={name || ''}
                                                                onBlur={({ target: { value } }) => {
                                                                    this.setState({ name: value })
                                                                }}
                                                                required
                                                            /> :
                                                                <Typography variant='body2'>{name}</Typography>
                                                                // <TextField
                                                                //     variant='standard'
                                                                //     size="small"
                                                                //     disabled
                                                                //     name="name"
                                                                //     sx={{ width: '100%' }}
                                                                //     value={name || ''}
                                                                //     required
                                                                // />
                                                            }
                                                        </Grid>

                                                        <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={4}>
                                                            <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('Công ty')}
                                                                <Tooltip title='Đây là trường bắt buộc'>
                                                                    <Typography variant='button' color='#d32f2f' >*</Typography>
                                                                </Tooltip>
                                                            </Typography>
                                                            {isEditing ? <Autocomplete
                                                                className='custom-autocomplete'
                                                                disabled={!isEditing}
                                                                disablePortal
                                                                size="small"
                                                                id="combo-box-demo"
                                                                value={branch_id.text || ''}
                                                                // inputValue={this.state.managerSearch}
                                                                onChange={(event, branchId) => {
                                                                    this.setState({ branch_id: branchId || {} });
                                                                }}
                                                                options={listBranch}
                                                                onInputChange={(event, value) => {
                                                                    // this.setState({ managerSearch: value })
                                                                    this.debounce(() => { this.onTextChangeBranch(value) }, 500)
                                                                }}
                                                                sx={{ width: '100%' }}
                                                                renderInput={(params) => (
                                                                    <TextField variant={'standard'}
                                                                        helperText={error} error={!!error}
                                                                        size="small" {...params} />
                                                                )}
                                                            /> : <Typography variant='body2'>{branch_id.text}</Typography>
                                                            }
                                                        </Grid>

                                                        <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={4}>
                                                            <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }}
                                                                variant={'button'}>{this.getLabel('Tổng tiền')}</Typography>
                                                            <Typography variant='body2'>{formatterRevenue.format(total_price)}</Typography>
                                                        </Grid>

                                                        <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={4}>
                                                            <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('Ngày bắt đầu')}
                                                                <Tooltip title='Đây là trường bắt buộc'>
                                                                    <Typography variant='button' color='#d32f2f' >*</Typography>
                                                                </Tooltip>
                                                            </Typography>
                                                            <Box sx={{ width: '100%' }}>
                                                                {isEditing ? <FormControl required sx={{ width: '100%' }}>
                                                                    <DateTimePicker
                                                                        className='custom-template'
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

                                                        <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }} item xs={12} md={4}>
                                                            <Typography display='flex' sx={{ userSelect: 'none', alignItems: 'center' }} variant={'button'}>{this.getLabel('Ngày kết thúc')}
                                                                <Tooltip title='Đây là trường bắt buộc'>
                                                                    <Typography variant='button' color='#d32f2f' >*</Typography>
                                                                </Tooltip>
                                                            </Typography>
                                                            <Box sx={{ width: '100%' }}>
                                                                {isEditing ? <FormControl required sx={{ width: '100%' }}>
                                                                    <DateTimePicker
                                                                        className='custom-template'
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

                                                    </Grid>
                                                </Box>
                                            </Grow>


                                        </Box>


                                        {!id ? null : <Box sx={{
                                            display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh-127px)', boxShadow: '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)',
                                            overflow: 'auto', width: '100%', backgroundColor: 'white', borderRadius: '4px', padding: '16px'
                                        }}>
                                            <Grid overflow='auto' item xs={12} md={12} lg={12}>
                                                <TabPurchaseLine
                                                    id={id}
                                                    name='Chi tiết'
                                                    isEditing={isEditing}
                                                    model='account.purchase.report.line'
                                                    line_ids={line_ids}
                                                    getData={this.purchaseInfo}
                                                    onCreateData={this.handleDataCreationLine}
                                                    handleDataEditing={this.handleDataEditing} />
                                            </Grid>
                                        </Box >}
                                    </Stack>

                                </Grid>
                            </Grid>
                        </Box>
                }
            </>
        )
    }
}

DetailBookFinacial.propTypes = {
    params: PropTypes.object,
    setParams: PropTypes.func,
    breadcrumb: PropTypes.array,
    loading: PropTypes.bool,
    showDialog: PropTypes.func
}

export default function (props) {
    const { showDialog, searchRead, loadViews, showNotification, nameSearch, setLoading, read, create, write, unlink } = useContext(UserContext)
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const id = parseInt(params.get('id'), 10)
    const user = JSON.parse(localStorage.getItem('userKey'))
    const [breadcrumb] = useState([{ name: 'Danh sách sổ mua hàng', path: routes.bookFinancial.path }])
    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme()
    const [value, setValue] = React.useState(0);


    const tabSx = {
        borderRight: '2px solid rgba(255,255,255,.1)',
        borderRadius: '2px', minWidth: '90px', fontSize: '13px', padding: '6px 8px', minHeight: '36px',
        fontWeight: 500
    }
    const handleChange = (event, tabIndex) => {
        setValue(tabIndex);
        localStorage.setItem('detailProjectActiveTab', tabIndex);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
        localStorage.setItem('detailProjectActiveTab', index);
    };

    return (
        <DetailBookFinacial {...props} {...{
            params, setParams, breadcrumb, showDialog, searchRead, loadViews, create, theme,
            read, id, user, isMobile, navigate, showNotification, nameSearch, setLoading, write,
            value, tabSx, handleChange, handleChangeIndex, unlink
        }} />

    )
}