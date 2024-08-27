import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import * as XLSX from 'xlsx';
import { v4 } from 'uuid';
// @mui
import { Card, CardHeader, Box, Stack, Typography, Autocomplete, TextField, Grid, Button } from '@mui/material';
// components
import { DateTimePicker } from '@mui/x-date-pickers';
import { useState, useContext, useMemo } from 'react';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import moment from 'moment';
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppTotalBusiness.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
    chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppTotalBusiness({ title, subheader, chartLabels, chartData, getValue, listBranch, dataExport, type, objective_type, business_unit_id, ...other }) {
    const currentYear = new Date().getFullYear()
    console.log('dataExport', chartData);
    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-01-01 00:00:00`))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-12-31 00:00:00`))
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })

    const { showDialog } = useContext(UserContext)

    const chartOptions = useChart({
        colors: ['#4CAF50', '#2196F3', '#FFC107'],
        plotOptions: { bar: { columnWidth: '16%' } },
        fill: { type: chartData.map((i) => i.fill) },
        labels: chartLabels,
        xaxis: { type: 'month' },
        yaxis: [
            {
                show: true,
                labels: {
                    formatter: (value) => formatterRevenue.format(value)
                },
                title: {
                    text: "Kế hoạch",
                    style: {
                        color: '#4CAF50',

                    }
                },
            },
            {
                opposite: true,
                labels: {
                    formatter: (value) => formatterRevenue.format(value)
                },
                title: {
                    text: "Thực tế",
                    style: {
                        color: '#2196F3',
                    }
                },
            }
        ],
        tooltip: {
            shared: true,
            intersect: false,
            y: [
                {
                    formatter: (y) => {
                        if (typeof y !== 'undefined') {
                            return formatterRevenue.format(y);
                        }
                        return y;
                    },
                },
                {
                    formatter: (y) => {
                        if (typeof y !== 'undefined') {
                            return formatterRevenue.format(y);
                        }
                        return y;
                    },
                },
                {
                    formatter: (y) => {
                        if (typeof y !== 'undefined') {
                            return `${y.toFixed(2)}%`;
                        }
                        return y;
                    },
                }
            ],
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
        getValue(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), branch_id.value, type, objective_type, business_unit_id)
    }

    const getDataForEnDate = (date) => {
        if (!starting_date || !branch_id) {
            showDialog('', 'Vui lòng chọn đủ thông tin')
            return
        }
        setEndingDate(date)
        setBranch_id(branch_id || {})
        getValue(moment(starting_date).format(DATE_TIME_FORMAT), moment(date).format(DATE_TIME_FORMAT), branch_id.value, type, objective_type, business_unit_id)
    }


    const totalDataMemo = useMemo(() => {
        if (!chartData[0].data || !chartData || chartData.length === 0) {
            return [];
        }

        const totalPlan = chartData[0].data.reduce((sum, value) => sum + value, 0);
        const totalActual = chartData[1].data.reduce((sum, value) => sum + value, 0);
        const totalTarAChi = totalActual !== 0 ? ((totalActual / totalPlan) * 100).toFixed(2) : '0.00';

        console.log('totalActual', chartData);

        return [
            {
                name: "Kế hoạch",
                data: `${formatterRevenue.format(totalPlan * 1000000)}`,
                color: '#4CAF50',
            },
            {
                name: "Thực tế",
                data: `${formatterRevenue.format(totalActual * 1000000)}`,
                color: '#2196F3',
            },
            {
                name: "Thực hiện",
                data: `${totalTarAChi} %`,
                color: '#FFC107',
            }
        ];
    }, [chartData]);




    const exportToExcel = (data, fileName = `${title}.xlsx`) => {

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
            <Stack direction='row' justifyContent='space-between' alignItems='center' padding='8px 0' >
                <Button sx={{ width: '132px' }} onClick={() => { exportToExcel(dataExport) }} color='success' size='small' variant='contained'>Xuất dữ liệu</Button>

                {totalDataMemo.length === 0 ? null : <Grid container spacing={2}>
                    <Grid item xs={12} sm={8} md={8} lg={8}>
                        <Grid container spacing={2}>
                            {totalDataMemo.slice(0, -3).map((item) => (
                                <Grid item xs={12} sm={2} md={2} lg={2} key={v4()}>
                                    <Stack direction='column' padding='8px' borderRadius='16px' sx={{ backgroundColor: item.color }} >
                                        <Typography variant='h6'>{item.data}</Typography>
                                        <Typography variant='body1'>{item.name}</Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                        <Box display="flex" justifyContent="flex-end">
                            <Grid container spacing={2}>
                                {totalDataMemo.slice(-3).map((item) => (
                                    <Grid item xs={12} sm={4} md={4} lg={4} key={v4()}>
                                        <Stack direction='column' padding='8px' borderRadius='16px' sx={{ backgroundColor: item.color }} >
                                            <Typography variant='h6'>{item.data}</Typography>
                                            <Typography variant='body1'>{item.name}</Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>}

                {/* <Grid container>
                    {totalDataMemo.map((item) => (
                        <Grid item xs={12} md={2} sm={2} lg={2} spacing={2}>
                            <Stack direction='column' padding='8px' borderRadius='16px' sx={{ backgroundColor: item.color }} >
                                <Typography variant='h4'>{item.data}</Typography>
                                <Typography variant='body1'>{item.name}</Typography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid> */}
                {/* <Stack padding='0 32px 0 0'>
            </Stack> */}
            </Stack >
            <Card sx={{ boxShadow: 'none' }}  {...other}>

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
                    <ReactApexChart type="line" series={chartData} options={chartOptions} height={500} width='100%' />
                </Box>
            </Card>
        </>
    );
}
