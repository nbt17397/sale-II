import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatterRevenue } from 'src/global';
import { v4 } from 'uuid';

export function AppPlanSales({ data, year, showTitle, customTitle, ...other }) {
    console.log('dataChart', data);
    const [chartData, setChartData] = React.useState({
        series: data,
        options: {
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: true
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    legend: {
                        position: 'bottom',
                        offsetX: -10,
                        offsetY: 0
                    }
                }
            }],
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 10,
                    borderRadiusApplication: 'end',
                    borderRadiusWhenStacked: 'last',
                    dataLabels: {
                        total: {
                            enabled: true,
                            formatter: (val) => {
                                return formatterRevenue.format(parseFloat(val).toFixed(2));
                            },
                            style: {
                                fontSize: '13px',
                                fontWeight: 900
                            }
                        }
                    }
                },
            },
            xaxis: {
                type: 'month',
                categories: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetY: 10
            },
            fill: {
                opacity: 1
            }
        },
    });

    const resultMemo = useMemo(() => {
        return data.map(item => ({
            name: item.name,
            sum: parseFloat(item.data.reduce((acc, curr) => acc + curr, 0)).toFixed(2)
        }));
    }, [data]);

    console.log('resultMemo', resultMemo);

    useEffect(() => {
        setChartData(prevState => ({
            ...prevState,
            series: data
        }));
    }, [data]);



    return (
        <>
            <Stack direction='row' justifyContent='flex-end' alignItems='center' padding='8px 0'>
                <Stack alignItems='center' padding=' 0px 0px 0px 16px' width='100%'>
                    {customTitle ? <Typography variant='h5'>{customTitle}</Typography> : <Typography variant='h5'>Kế Hoạch Doanh Thu {year || ''} (Tỷ Đồng)</Typography>}
                </Stack>

                {showTitle ? <Grid container spacing={2}>
                    <Grid item xs={12} sm={8} md={8} lg={8}>
                        <Grid container spacing={2}>
                            {resultMemo.slice(0, -2).map((item) => (
                                <Grid item xs={12} sm={3} md={3} lg={3} key={v4()}>
                                    <Stack alignItems='center' sx={{ background: item.name === 'KDTT' ? '#008FFB' : '#00E396', borderRadius: '16px' }} direction='column' padding='16px'>
                                        <Typography variant='h4'>{item.sum} tỷ</Typography>
                                        <Typography variant='body2'>{item.name}</Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                        <Box display="flex" justifyContent="flex-end">
                            <Grid container spacing={2}>
                                {resultMemo.slice(-2).map((item) => (
                                    <Grid item xs={12} sm={6} md={6} lg={6} key={v4()}>
                                        <Stack alignItems='center' sx={{ background: item.name === 'KDTT' ? '#008FFB' : '#00E396', borderRadius: '16px' }} direction='column' padding='16px'>
                                            <Typography variant='h4'>{item.sum} tỷ</Typography>
                                            <Typography variant='body2'>{item.name}</Typography>
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid> : null}



            </Stack>
            <Card sx={{ boxShadow: 'none' }} {...other}>
                <Box sx={{ p: 1, pb: 1 }} dir="ltr">
                    <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={500} />
                </Box>
            </Card >
        </>
    );
}