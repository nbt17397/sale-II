import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import * as XLSX from 'xlsx';
import { v4 } from 'uuid';
// @mui
import { Card, CardHeader, Box, Stack, Typography, Autocomplete, TextField, Grid, Button, useTheme, useMediaQuery } from '@mui/material';
// components
import { DateTimePicker } from '@mui/x-date-pickers';
import { useState, useContext, useMemo } from 'react';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import moment from 'moment';
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppBusinessActivity.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
    chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppBusinessActivity({ title, subheader, chartLabels, chartData, getValue, listBranch, dataExport, type, objective_type, business_unit_id, year, ...other }) {
    const currentYear = new Date().getFullYear()
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));

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
                    text: "Doanh thu",
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
                    text: "Lợi nhuận sau thuế",
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




    const totalDataMemo = useMemo(() => {
        if (!chartData[0].data || !chartData || chartData.length === 0) {
            return [];
        }

        const totalPlan = chartData[0].data.reduce((sum, value) => sum + value, 0);
        const totalActual = chartData[1].data.reduce((sum, value) => sum + value, 0);
        const totalTarAChi = totalActual !== 0 ? ((totalActual / totalPlan) * 100).toFixed(2) : '0.00';

        return [
            {
                name: "Doanh thu",
                data: `${formatterRevenue.format(totalPlan)}`,
                color: '#4CAF50',
            },
            {
                name: "Lợi nhuận sau thuế",
                data: `${formatterRevenue.format(totalActual)}`,
                color: '#2196F3',
            },
            {
                name: "Thực hiện",
                data: `${totalTarAChi} %`,
                color: '#FFC107',
            }
        ];
    }, [chartData]);

    console.log(chartData);


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
            <Stack direction='row' justifyContent='center' alignItems='flex-start' padding='8px 0' >
                {/* <Button sx={{ width: '132px' }} onClick={() => { exportToExcel(dataExport) }} color='success' size='small' variant='contained'>Xuất dữ liệu</Button> */}
                {year ? <Typography variant='h5'>{year}</Typography> : null}
                {totalDataMemo.length > 0 && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={12} md={8} lg={8}>
                            <Grid container spacing={2}>
                                {totalDataMemo.slice(0, -3).map((item) => (
                                    <Grid item xs={6} sm={4} md={4} lg={2} key={v4()}>
                                        <Stack
                                            direction='column'
                                            padding='8px'
                                            borderRadius='16px'
                                            sx={{
                                                backgroundColor: item.color,
                                                height: '100%' // Đảm bảo chiều cao đồng đều
                                            }}
                                        >
                                            <Typography
                                                variant='h6'
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.9rem',
                                                        sm: '1rem',
                                                        md: '1.1rem',
                                                        lg: '1.2rem',
                                                    },
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {item.data}
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.7rem',
                                                        sm: '0.8rem',
                                                        md: '0.9rem',
                                                        lg: '1rem',
                                                    }
                                                }}
                                            >
                                                {item.name}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                                <Grid container spacing={2}>
                                    {totalDataMemo.slice(-3).map((item) => (
                                        <Grid item xs={4} sm={4} md={4} lg={4} key={v4()}>
                                            <Stack
                                                direction='column'
                                                padding='8px'
                                                borderRadius='16px'
                                                sx={{
                                                    backgroundColor: item.color,
                                                    height: '100%' // Đảm bảo chiều cao đồng đều
                                                }}
                                            >
                                                <Typography
                                                    variant='h6'
                                                    sx={{
                                                        fontSize: {
                                                            xs: '0.9rem',
                                                            sm: '1rem',
                                                            md: '1.1rem',
                                                            lg: '1.2rem',
                                                        },
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {item.data}
                                                </Typography>
                                                <Typography
                                                    variant='body2'
                                                    sx={{
                                                        fontSize: {
                                                            xs: '0.7rem',
                                                            sm: '0.8rem',
                                                            md: '0.9rem',
                                                            lg: '1rem',
                                                        }
                                                    }}
                                                >
                                                    {item.name}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                )}

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
