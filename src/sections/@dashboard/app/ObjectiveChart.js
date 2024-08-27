import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import * as XLSX from 'xlsx';
// @mui
import { Card, CardHeader, Box, Stack, Typography, Autocomplete, TextField, Grid, Button, useTheme, useMediaQuery } from '@mui/material';
// components
import { DateTimePicker } from '@mui/x-date-pickers';
import { useState, useContext, useMemo } from 'react';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import moment from 'moment';
import { v4 } from 'uuid';
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

ObjectiveChart.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
    chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function ObjectiveChart({ title, subheader, chartLabels, chartData, getValue, listBranch, dataExport, type, objective_type, ...other }) {

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const isMd = useMediaQuery(theme.breakpoints.only('md'));

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
        yaxis: { show: true, labels: { formatter: (value) => { return formatterRevenue.format(value * 1000000) } } },

        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (y) => {
                    if (typeof y !== 'undefined') {
                        return `${formatterRevenue.format(y * 1000000)}`;
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
        getValue(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), branch_id.value, type, objective_type)
    }

    const getDataForEnDate = (date) => {
        if (!starting_date || !branch_id) {
            showDialog('', 'Vui lòng chọn đủ thông tin')
            return
        }
        setEndingDate(date)
        setBranch_id(branch_id || {})
        getValue(moment(starting_date).format(DATE_TIME_FORMAT), moment(date).format(DATE_TIME_FORMAT), branch_id.value, type, objective_type)
    }



    const totalDataMemo = useMemo(() => {
        if (!chartData[0].data || !chartData || chartData.length === 0) {
            return [];
        }

        const totalPlan = chartData[0].data.reduce((sum, value) => sum + value, 0);
        const totalActual = chartData[1].data.reduce((sum, value) => sum + value, 0);

        return [
            {
                name: "Kế hoạch (tỷ)",
                data: `${formatterRevenue.format(totalPlan * 1000000)}`,
                color: '#1876D2',
            },
            {
                name: "Thực tế (tỷ)",
                data: `${formatterRevenue.format(totalActual * 1000000)}`,
                color: '#ED6D03',
            },
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
            <Stack direction='column' alignItems='center'>
                <Typography marginTop='8px' variant='h5'>Biểu Đồ {title}</Typography>



                <Stack width='100%' direction='row' justifyContent='space-between' alignItems='center' >
                    <Button sx={{ width: '125px' }} onClick={() => { exportToExcel(dataExport) }} color='success' size='small' variant='contained'>Xuất dữ liệu</Button>
                    {totalDataMemo.length === 0 ? null : (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8} md={8} lg={8}>
                                <Grid container spacing={2}>
                                    {totalDataMemo.slice(0, -2).map((item) => (
                                        <Grid item xs={12} sm={3} md={3} lg={3} key={v4()}>
                                            <Stack direction='column' padding='8px' borderRadius='16px' sx={{ backgroundColor: item.color }}>
                                                <Typography
                                                    variant='h6'
                                                    sx={{
                                                        fontSize: {
                                                            xs: '1rem',
                                                            sm: '1.1rem',
                                                            md: '1.2rem',
                                                            lg: '1.3rem',
                                                        }
                                                    }}
                                                >
                                                    {item.data}
                                                </Typography>
                                                <Typography
                                                    variant='body1'
                                                    sx={{
                                                        fontSize: {
                                                            xs: '0.8rem',
                                                            sm: '0.9rem',
                                                            md: '1rem',
                                                            lg: '1.1rem',
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
                            <Grid item xs={12} sm={4} md={4} lg={4}>
                                <Box display="flex" justifyContent="flex-end">
                                    <Grid container spacing={2}>
                                        {totalDataMemo.slice(-2).map((item) => (
                                            <Grid item xs={12} sm={6} md={6} lg={6} key={v4()}>
                                                <Stack direction='column' padding='8px' borderRadius='16px' sx={{ backgroundColor: item.color }}>
                                                    <Typography
                                                        variant='h6'
                                                        sx={{
                                                            fontSize: {
                                                                xs: '1rem',
                                                                sm: '1.1rem',
                                                                md: '1.2rem',
                                                                lg: '1.3rem',
                                                            }
                                                        }}
                                                    >
                                                        {item.data}
                                                    </Typography>
                                                    <Typography
                                                        variant='body1'
                                                        sx={{
                                                            fontSize: {
                                                                xs: '0.8rem',
                                                                sm: '0.9rem',
                                                                md: '1rem',
                                                                lg: '1.1rem',
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
                </Stack>
            </Stack>


            <Card sx={{ boxShadow: 'none' }}  {...other}>
                <Box sx={{ p: 3, pb: 1 }} dir="ltr">
                    <ReactApexChart type="line" series={chartData} options={chartOptions} height={500} />
                </Box>
            </Card>
        </>
    );
}
