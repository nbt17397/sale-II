import { Autocomplete, Box, Button, Chip, Divider, Drawer, FormControl, Grid, MenuItem, Pagination, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, getFieldSelection, routes } from 'src/global'
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar'
import { v4 } from 'uuid'


function getMonthRange(month, year) {
    // Tạo đối tượng Date từ năm và tháng được truyền vào
    const date = new Date(year, month, 1);

    // Lấy ngày đầu tiên của tháng
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);

    // Lấy ngày cuối cùng của tháng
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    // Lấy ngày đầu tiên của tháng trước
    const beforeStartDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);

    // Lấy ngày cuối cùng của tháng trước
    const beforeEndDate = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59);

    return { startDate, endDate, beforeStartDate, beforeEndDate };
}

function getQuarterRange(quarterValue) {
    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear() + 3;

    // Tính quý dựa trên giá trị truyền vào (12 = quý 1, 13 = quý 2, 14 = quý 3, 15 = quý 4)
    const quarter = quarterValue - 12;

    // Tính tháng đầu tiên của quý
    const startMonth = (quarter - 1) * 3;
    const startYear = startMonth < 0 ? currentYear - 1 : currentYear;
    const adjustedStartMonth = startMonth < 0 ? startMonth + 12 : startMonth;

    // Tạo ngày đầu tiên của quý
    const startDate = new Date(startYear, adjustedStartMonth, 1);

    // Tính tháng cuối cùng của quý
    const endMonth = adjustedStartMonth + 2;
    const endYear = new Date().getFullYear() + 2;
    const adjustedEndMonth = endMonth > 11 ? endMonth - 12 : endMonth;

    // Tạo ngày cuối cùng của quý với thời gian là 23:59:59
    const endDate = new Date(endYear, adjustedEndMonth, new Date(endYear, adjustedEndMonth + 1, 0).getDate(), 23, 59, 59);

    // Tính tháng đầu tiên của quý trước đó
    const startMonthBefore = startMonth - 3;
    const startYearBefore = startMonthBefore < 0 ? currentYear - 1 : currentYear;
    const adjustedStartMonthBefore = startMonthBefore < 0 ? startMonthBefore + 12 : startMonthBefore;

    // Tạo ngày đầu tiên của quý trước đó
    const beforeStartDate = new Date(startYearBefore, adjustedStartMonthBefore, 1);


    // Tính tháng cuối cùng của quý trước đó
    const endMonthBefore = adjustedStartMonthBefore + 2;
    const endYearBefore = new Date().getFullYear() + 2;
    const adjustedEndMonthBefore = endMonthBefore > 11 ? endMonthBefore - 12 : endMonthBefore;

    // Tạo ngày cuối cùng của quý trước đó với thời gian là 23:59:59
    const beforeEndDate = new Date(endYearBefore, adjustedEndMonthBefore, new Date(endYearBefore, adjustedEndMonthBefore + 1, 0).getDate(), 23, 59, 59);

    return {
        startDate,
        endDate,
        beforeStartDate,
        beforeEndDate
    };
}


const ObjectiveViewOnly = () => {
    const navigate = useNavigate()
    const [dataList, setDataList] = useState([])
    const [fieldOfView, setFieldOfView] = useState({})
    const { loadViews, setLoading, searchRead, showDialog, nameSearch } = useContext(UserContext)
    const [page, setPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [open, setOpen] = useState(false)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear()
    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-01-01 00:00:00`))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-12-01 00:00:00`).endOf('month'));
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })
    const [listBranch, setListBranch] = useState([])
    const [time, setTime] = useState({})
    const [listTime] = useState([
        { value: 0, text: 'Tháng 1', label: 'Tháng 1' },
        { value: 1, text: 'Tháng 2', label: 'Tháng 2' },
        { value: 2, text: 'Tháng 3', label: 'Tháng 3' },
        { value: 3, text: 'Tháng 4', label: 'Tháng 4' },
        { value: 4, text: 'Tháng 5', label: 'Tháng 5' },
        { value: 5, text: 'Tháng 6', label: 'Tháng 6' },
        { value: 6, text: 'Tháng 7', label: 'Tháng 7' },
        { value: 7, text: 'Tháng 8', label: 'Tháng 8' },
        { value: 8, text: 'Tháng 9', label: 'Tháng 9' },
        { value: 9, text: 'Tháng 10', label: 'Tháng 10' },
        { value: 10, text: 'Tháng 11', label: 'Tháng 11' },
        { value: 11, text: 'Tháng 12', label: 'Tháng 12' },
        { value: 12, text: 'Quý 1', label: 'Quý 1' },
        { value: 13, text: 'Quý 2', label: 'Quý 2' },
        { value: 14, text: 'Quý 3', label: 'Quý 3' },
        { value: 15, text: 'Quý 4', label: 'Quý 4' },
        { value: 16, text: 'Năm', label: 'Năm' },
    ])
    const [type, setType] = useState(null)
    const [listType, setListType] = useState([])


    const getData = async (limit, offset, branch_id, type, starting, ending) => {
        setLoading(true)
        const filters = [
            ["starting_date", ">=", starting_date],
            ["ending_date", "<=", ending_date],
        ];

        if (branch_id) {
            filters.push(['branch_id', '=', branch_id]);
        }

        if (type) {
            filters.push(['type', '=', type])
        }

        const json = await searchRead('company.objective', ['name', 'type', 'business_unit_id', 'branch_id'],
            filters, { sort: 'id desc', limit, offset })
        if (json.error) {
            showDialog('', json.error.data.message)
            return
        }

        setDataList(json.result.records)
        setPage(json.result.length)
        setLoading(false)

        console.log('json', json);
    }


    const onTextChangeBranch = async (value = '') => {
        const json = await nameSearch('res.company.modify', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        setListBranch(result)
    }

    const fetchView = (async () => {
        const json = await loadViews('company.objective', ['list']);

        if (json.error) {
            setLoading('', json.error.data.message);
            return;
        }
        const result = json.result.fields;
        const listTypes = getFieldSelection(result, 'type')
        setListType([{ text: 'All', value: false }, ...listTypes])
        setFieldOfView(result)
    })

    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

    const handlePageChange = (events, page) => {
        setCurrentPage(page);
        if (page < 0 || page >= Math.ceil(page / 40)) {
            console.log('Trang không hợp lệ');
        }
        if (page === 1) {
            getData(40, 0, branch_id.value, type.value)
        } else {
            const startIndex = (page * 40 - 40) + 1;
            getData(40, startIndex, branch_id?.value || false, type?.value || false)
        }

    };

    const handleChangeTime = (event, value) => {
        console.log('value', value);
        setTime(value);
        if (value) {
            const currentYear = new Date().getFullYear();

            if (value.value < 12) {
                // Nếu là tháng
                const { startDate, endDate, } = getMonthRange(value.value, currentYear);
                setStartingDate(moment(startDate))
                setEndingDate(moment(endDate))

                console.log('startDate', moment(endDate), (moment(startDate)))

            } else if (value.value >= 12 && value.value <= 15) {
                // Nếu là quý
                const quarter = value.value - 11;
                const { startDate, endDate, } = getQuarterRange(quarter, currentYear);
                setStartingDate(moment(startDate));
                setEndingDate(moment(endDate));
            } else {
                // Nếu là năm
                setStartingDate(moment(new Date(currentYear, 0, 1)));
                setEndingDate(moment(new Date(currentYear, 11, 31, 23, 59, 59)));
            }
        } else {
            setStartingDate(null);
            setEndingDate(null);
        }
    };


    const handlefilter = async (branch, type) => {
        await getData(40, 0, branch, type)
        setOpen(false)
    }
    useEffect(() => { getData(40, 0, branch_id?.value || false, type?.value || false); fetchView(); onTextChangeBranch() }, [])



    return (
        <Box className='fade-in-effect' sx={{ display: 'flex', flexDirection: 'column', gap: '24px', }}>
            <HeaderToolbar routeName='Mục tiêu công ty'
                //  buttons={[{
                //     text: 'Tạo', onClick: () => {
                //         navigate({
                //             pathname: routes.DetailCompanyObjective.path,
                //             search: createSearchParams({ "id": '' }).toString()
                //         })
                //     }
                // }
                // ]}
                actions={[{
                    text: 'Lọc dữ liệu',
                    onClick: () => {
                        setOpen(true)
                    },
                },]}

                searchFields={[
                    { text: 'tên dự án', value: 'name' },
                    { text: 'tên chiến dịch', value: 'campaign_id' },
                ]}
            // Các trường tìm kiếm khác

            // onDomainChange={handleDomainChange}

            />
            < Box sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto', backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>

                <Stack marginBottom='16px' width='100%' justifyContent='space-between' direction='row' gap='16px'>
                    {page > 10 ? <Pagination
                        shape="rounded"
                        variant='outlined'
                        onChange={handlePageChange}
                        page={currentPage}
                        count={Math.ceil(page / 40)} /> : null}

                    <Stack direction='row' gap='16px' padding='8px'>

                        {starting_date ? <Chip label={`Bắt đầu ${moment(starting_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null}
                        {ending_date ? <Chip label={`Kết thúc ${moment(ending_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null}
                        {branch_id && <Chip label={`${branch_id.text}`} />}
                        {type && <Chip label={`${type?.text || ''}`} />}
                    </Stack>

                </Stack>

                <Divider sx={{ marginBottom: '8px' }} />


                <Grid container spacing={2}>


                    {dataList.length === 0 && <Grid className='fade-in-effect' item xs={12} sm={12} md={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', flexDirection: 'column', gap: '8px' }}>
                            <img style={{ width: '160px', height: '160px' }} alt='no data' src='\assets\illustrations\no_data.png' />
                            <Typography color='GrayText' variant='h6'>Chưa có dữ liệu</Typography>
                        </Box>
                    </Grid>}
                    {dataList.map(({ name, id, type, business_unit_id, branch_id }) => (
                        <Grid className='fade-in-effect' key={v4()} item xs={12} sm={6} md={3}>
                            <Box onClick={() => { navigate({ pathname: routes.DetailObjectiveView.path, search: createSearchParams({ "id": id, notifications: true }).toString() }) }} component={Button} sx={{
                                width: '100%', padding: '16px', borderRadius: '4px', gap: '8px',
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                border: '1px soild #dee2e6', color: 'white',
                                boxShadow: '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundImage: `url('/assets/images/covers/card-background2.png')`,
                                backgroundColor: 'transparent'
                            }}>
                                <Stack color='black' direction='column' gap='8px' width='100%' justifyContent='flex-start' textAlign='left'>
                                    <Stack direction='row' justifyContent='space-between' >
                                        <Typography variant='button' sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}> {name} </Typography>
                                    </Stack>
                                    <Stack direction='column'>
                                        <Stack direction='row' gap='32px'>
                                            <Typography component='div' sx={{ maxHeight: '132px', whiteSpace: 'pre-wrap', textOverflow: 'ellipsis', overflow: 'hidden' }} variant='caption'>{getLabel('type')}: {type}</Typography>
                                        </Stack>
                                        <Stack direction='row' gap='32px'>
                                            <Typography component='div' sx={{ maxHeight: '132px', whiteSpace: 'pre-wrap', textOverflow: 'ellipsis', overflow: 'hidden' }} variant='caption'>{getLabel('business_unit_id')}: {business_unit_id[1]}</Typography>
                                            <Typography component='div' sx={{ maxHeight: '132px', whiteSpace: 'pre-wrap', textOverflow: 'ellipsis', overflow: 'hidden' }} variant='caption'>{getLabel('branch_id')}: {branch_id[1]}</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>


                            </Box>
                        </Grid>
                    ))}

                </Grid>
            </Box>

            <Drawer
                className='bg-drawer'
                anchor={'right'}
                open={open}
                onClose={() => setOpen(false)}
            >
                <Stack direction='column' width='450px' padding='16px' alignItems='flex-start' gap='16px'>
                    <Typography variant='h6'>Lọc dữ liệu</Typography>
                    <Divider sx={{ width: '100%' }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8} sm={8} lg={8}>
                            <Stack direction='column'>
                                <Typography variant='caption'>Công ty</Typography>
                                <Autocomplete
                                    className='custom-autocomplete'
                                    disablePortal
                                    id="combo-box-demo"
                                    value={branch_id?.text || ''}
                                    // inputValue={this.state.managerSearch}
                                    onChange={(event, branchId) => {
                                        setBranch_id(branchId)
                                    }}
                                    options={listBranch}

                                    sx={{ width: '100%' }}
                                    renderInput={(params) => (
                                        <TextField placeholder='Chọn công ty'
                                            variant={'outlined'}
                                            {...params} />
                                    )} />
                            </Stack>
                        </Grid>
                        <Grid xs={12} md={4} sm={4} lg={4} />
                        <Grid item xs={12} md={8} sm={8} lg={8}>
                            <Stack direction='column'>
                                <Typography variant='caption'>Loại</Typography>
                                <Select required
                                    className='custom-textfiled'
                                    variant={'outlined'}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    size="small"
                                    value={type?.text || ''}
                                    renderValue={(p) => p}
                                    onChange={({ target: { value: type } }) => {
                                        setType(type)
                                        // this.handelUpdateState(projectType)
                                    }}
                                >
                                    {listType.map((option) => (
                                        <MenuItem key={option.value} value={option}>
                                            {option.text}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Grid>
                        <Grid xs={12} md={4} sm={4} lg={4} />
                        <Grid item xs={12} md={8} sm={8} lg={8}>
                            <Stack direction='column'>
                                <Typography variant='caption'>Thời gian</Typography>
                                <Autocomplete
                                    className='custom-autocomplete'
                                    disablePortal
                                    id="combo-box-demo"
                                    value={time?.text || ''}
                                    // inputValue={this.state.managerSearch}
                                    onChange={(event, time) => {
                                        handleChangeTime(event, time)
                                    }}
                                    // onChange={handleChangeTime}
                                    options={listTime}
                                    sx={{ width: '100%' }}
                                    renderInput={(params) => (
                                        <TextField placeholder='Chọn thời gian'
                                            variant={'outlined'}
                                            {...params} />
                                    )} />
                            </Stack>
                        </Grid>

                        <Grid sx={{ alignItems: 'center', display: 'flex', gap: '4px' }} item xs={12} md={12} sm={12} lg={12}>
                            <Stack direction='column'>
                                <Typography variant='caption'>Ngày bắt đầu</Typography>
                                <DateTimePicker
                                    disabled
                                    className='custom-template'
                                    size="small"
                                    variant='standard'
                                    format={DATE_FORMAT_TO_DISPLAY}
                                    onChange={(date) => { setStartingDate(date) }}
                                    value={starting_date}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                        },
                                    }} />
                            </Stack>
                            <Typography variant='caption'>Đến</Typography>
                            <Stack direction='column'>
                                <Typography variant='caption'>Ngày kết thúc</Typography>
                                <DateTimePicker
                                    disabled
                                    className='custom-template'
                                    size="small"
                                    format={DATE_FORMAT_TO_DISPLAY}
                                    onChange={(date) => { setEndingDate(date) }}
                                    value={ending_date}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                        },
                                    }}
                                />
                            </Stack>
                        </Grid>


                    </Grid>
                    <Stack direction='row-reverse' width='100%'>
                        <Button onClick={() => { handlefilter(branch_id?.value || false, type?.value || false) }}
                            variant='contained' color='success' sx={{ boxShadow: 'none' }}>Xác nhận</Button>
                    </Stack>
                </Stack>
            </Drawer>
        </Box >
    )
}

export default ObjectiveViewOnly