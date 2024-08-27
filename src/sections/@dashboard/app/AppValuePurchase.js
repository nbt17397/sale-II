import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import * as XLSX from 'xlsx';
// @mui
import { Card, CardHeader, Box, Stack, Typography, Autocomplete, TextField, Grid, Button } from '@mui/material';
// components
import { DateTimePicker } from '@mui/x-date-pickers';
import { useState, useContext } from 'react';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import moment from 'moment';
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppValuePurchase.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
    chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppValuePurchase({ title, subheader, chartLabels, chartData, getValuePurchaseByMonth, listBranch, dataExport, ...other }) {
    const currentYear = new Date().getFullYear()
    console.log('dataExport', dataExport);
    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-01-01 00:00:00`))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-12-31 00:00:00`))
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })

    const { showDialog } = useContext(UserContext)

    const chartOptions = useChart({
        plotOptions: { bar: { columnWidth: '16%' } },
        fill: { type: chartData.map((i) => i.fill) },
        labels: chartLabels,
        xaxis: { type: 'month' },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (y) => {
                    if (typeof y !== 'undefined') {
                        return `${formatterRevenue.format(y.toFixed(0))}`;
                    }
                    return y;
                },
            },
        },
    });

    console.log('chartData', chartData);
    console.log('chartData', chartLabels);

    const getDataForBranch = (branch_id) => {
        if (!starting_date || !ending_date) {
            showDialog('', 'Vui lòng chọn thời gian')
            return
        }
        setBranch_id(branch_id || {})
        getValuePurchaseByMonth(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), branch_id.value)
    }

    const getDataForEnDate = (date) => {
        if (!starting_date || !branch_id) {
            showDialog('', 'Vui lòng chọn đủ thông tin')
            return
        }
        setEndingDate(date)
        setBranch_id(branch_id || {})
        getValuePurchaseByMonth(moment(starting_date).format(DATE_TIME_FORMAT), moment(date).format(DATE_TIME_FORMAT), branch_id.value)
    }


    const exportToExcel = (data, fileName = 'Giá Trị Mua Hàng.xlsx') => {

        // Tạo một workbook mới
        const workbook = XLSX.utils.book_new();

        // Tạo một worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Tạo file Excel và tải xuống
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <>
            <Stack direction='row' justifyContent='space-between' alignItems='center' padding='8px 0'>
                <Button onClick={() => { exportToExcel(dataExport) }} color='success' size='small' variant='contained'>Xuất dữ liệu</Button>
                <Stack padding='0 32px 0 0'>
                    <Typography variant='h5'>Triệu đồng</Typography>
                </Stack>
            </Stack >
            <Card sx={{ boxShadow: 'none' }} {...other}>

                {/* <Box borderRadius='4px' sx={{ backgroundColor: '#F8F8F8' }} padding='8px'>
                    <Grid container spacing={3}  >
                        <Grid item xs={12} md={3} sm={3} lg={3}>
                            <Autocomplete
                                className='custom-autocomplete'
                                disablePortal
                                id="combo-box-demo"
                                value={branch_id?.text || ''}
                                // inputValue={this.state.managerSearch}
                                onChange={(event, branchId) => {
                                    getDataForBranch(branchId)
                                }}
                                options={listBranch}

                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField variant={'outlined'}
                                        {...params} />
                                )} />

                        </Grid>
                        <Grid sx={{ alignItems: 'center', display: 'flex', gap: '4px' }} item xs={12} md={4} sm={4} lg={4}>
                            <DateTimePicker
                                className='custom-template'
                                size="small"
                                variant='standard'
                                format={DATE_TIME_FORMAT_TO_DISPLAY}
                                onChange={(date) => { setStartingDate(date) }}
                                value={starting_date}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '40px',
                                    },
                                }}
                            />
                            <Typography variant='caption'>Đến</Typography>
                            <DateTimePicker
                                className='custom-template'
                                size="small"
                                format={DATE_TIME_FORMAT_TO_DISPLAY}
                                onChange={(date) => { getDataForEnDate(date) }}
                                value={ending_date}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '40px',
                                    },
                                }}
                            />

                        </Grid>
                    </Grid>
                </Box> */}


                {/* 
             <Stack direction='row' gap='8px' alignItems='center' padding='8px 24px'>
                <DateTimePicker
                    className='custom-template'
                    size="small"
                    variant='standard'
                    format={DATE_TIME_FORMAT_TO_DISPLAY}
                    onChange={(date) => { setStartingDate(date) }}
                    value={starting_date}
                />
                <Typography variant='caption'>Đến</Typography>
                <DateTimePicker
                    className='custom-template'
                    size="small"
                    format={DATE_TIME_FORMAT_TO_DISPLAY}
                    onChange={(date) => { getDataForEnDate(date) }}
                    value={ending_date}
                />

                <Autocomplete
                    className='custom-autocomplete'

                    disablePortal
                    id="combo-box-demo"
                    value={branch_id?.text || ''}
                    // inputValue={this.state.managerSearch}
                    onChange={(event, branchId) => {
                        getDataForBranch(branchId)
                    }}
                    options={listBranch}

                    sx={{ width: '23%' }}
                    renderInput={(params) => (
                        <TextField variant={'outlined'}
                            {...params} />
                    )} />
              </Stack> */}

                <Box sx={{ p: 3, pb: 1 }} dir="ltr">
                    <ReactApexChart type="line" series={chartData} options={chartOptions} height={500} />
                </Box>
            </Card>
        </>
    );
}
