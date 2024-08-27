import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import * as XLSX from 'xlsx';
// @mui
import { Card, CardHeader, Box, Stack, Typography, Autocomplete, TextField, Grid, Button, styled, alpha } from '@mui/material';
import { viVN } from '@mui/x-data-grid/locales'
import { DataGrid, gridClasses } from '@mui/x-data-grid';
// components
import { DateTimePicker } from '@mui/x-date-pickers';
import { useState, useContext } from 'react';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import moment from 'moment';
import { useChart } from '../../../components/chart';


const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: '#fff',
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

AppBusinessOfYear.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
    chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};


function AppBusinessOfYear({ title, subheader, chartLabels, chartData, dataExport, dataTable, ...other }) {



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

    const columns = [
        // { field: 'code', headerName: '#', width: 90 },
        {
            field: 'name',
            headerName: 'Tiêu chí',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {params.row.name}
                </Typography>, flex: 0.6
        },
        {
            field: 'jan',
            headerName: 'Tháng 01',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.jan)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'feb',
            headerName: 'Tháng 02',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.feb)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'mar',
            headerName: 'Tháng 03',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.mar)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'apr',
            headerName: 'Tháng 04',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.apr)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'may',
            headerName: 'Tháng 05',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.may)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'jun',
            headerName: 'Tháng 06',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.jun)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'jul',
            headerName: 'Tháng 07',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.jul)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'aug',
            headerName: 'Tháng 08',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.aug)}
                </Typography>,
            flex: 0.2

        },

        {
            field: 'sep',
            headerName: 'Tháng 09',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.sep)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'oct',
            headerName: 'Tháng 10',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.oct)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'nov',
            headerName: 'Tháng 11',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.nov)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'dec',
            headerName: 'Tháng 12',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.dec)}
                </Typography>,
            flex: 0.2

        },
        {
            field: 'total',
            headerName: 'Tổng',
            headerAlign: 'center',
            renderCell: (params) =>
                <Typography variant='caption' >
                    {formatterRevenue.format(params.row.total)}
                </Typography>,
            flex: 0.2
        },
    ]


    return (
        <>
            {dataTable ? <Box width='100%' sx={{ paddingTop: '16px' }}>
                <StripedDataGrid
                    sx={{
                        [`& .${gridClasses.cell}`]: {
                            py: 1,
                            borderRight: '1px solid #ccc', // Thêm đường kẻ phân cách cột
                            '&:last-child': {
                                borderRight: 'none', // Loại bỏ đường kẻ cho cột cuối cùng
                            },
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            textOverflow: "clip",
                            whiteSpace: "break-spaces",
                            lineHeight: 1
                        }, border: 0
                    }}
                    getRowHeight={() => 'auto'}
                    className="custom-dataGrid"
                    rows={dataTable}
                    columns={columns}
                    pageSize={10}
                    autoHeight {...dataTable}
                    hideFooter
                    initialState={{
                        ...dataTable.initialState,
                        pagination: { paginationModel: { pageSize: 100 } },
                    }}
                    localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    } />
            </Box> : null}

            <Card sx={{ boxShadow: 'none' }}>
                <Box sx={{ p: 3, pb: 1, marginTop: 4 }} dir="ltr">
                    <ReactApexChart type="line" series={chartData} options={chartOptions} height={500} />
                </Box>
            </Card>

        </>
    )
}

export default AppBusinessOfYear
