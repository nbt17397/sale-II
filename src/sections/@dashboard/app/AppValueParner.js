import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { useState, useContext, useEffect } from 'react';
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import * as XLSX from 'xlsx';
// @mui
import { Autocomplete, Box, Card, CardHeader, TextField, Typography, Grid, Button, Stack } from '@mui/material';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { useChart } from '../../../components/chart';


// ----------------------------------------------------------------------

AppValueParner.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
};

export default function AppValueParner({ title, subheader, chartData, getValuePurchaseByParner, listBranch, dataExport, filterPrice, ...other }) {
    const { showDialog, searchRead } = useContext(UserContext)
    const currentYear = new Date().getFullYear()
    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-01-01 00:00:00`))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-12-31 00:00:00`))
    const [product, setProduct] = useState({})
    const [listProduct, setListProduct] = useState([])
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })
    const [price, setPrice] = useState(0)
    const [vthh, setVthh] = useState({})
    const [listVthh, setListVthh] = useState([])

    const chartLabels = chartData.map((i) => i.label);

    const chartSeries = chartData.map((i) => i.value);

    const chartOptions = useChart({
        tooltip: {
            marker: { show: false },
            y: {
                formatter: (seriesName) => formatterRevenue.format(seriesName),
                title: { formatter: () => '', },
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '76%',
                borderRadius: 2,
            },
        },
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#FFA500'], // Màu cam
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: 'none'
            },
            formatter: (val, opt) => {
                return formatterRevenue.format(val);
            },
            offsetX: 0,
            dropShadow: {
                enabled: true
            }
        },
        xaxis: {
            categories: chartLabels,
            labels: {
                style: {
                    colors: '#000',
                },
            },
        },
        yaxis: {
            labels: {
                maxWidth: 700,
                style: {
                    colors: '#000',
                },
            },
        },
    });

    const getDataForEnDate = (date) => {
        if (!starting_date) {
            showDialog('', 'Vui lòng chọn đủ thông tin')
            return
        }
        setEndingDate(date)
        getValuePurchaseByParner(moment(starting_date).format(DATE_TIME_FORMAT), moment(date).format(DATE_TIME_FORMAT))
    }

    const onTextChangeProduct = async (value = '') => {
        const filters = [
            ["model", "ilike", value],
        ];

        const json = await searchRead('product.product', ['model'], value && filters || [])

        const result = json.result.records.map((option) => ({ value: option.id, text: option.model, label: option.model, }))
        setListProduct(result)
    }

    const onTextChangeGroup = async (value = '') => {
        const filters = [
            ["model", "ilike", value],
        ];

        const json = await searchRead('product.group', ['name'], value && filters || [])
        const result = json.result.records.map((option) => ({ value: option.id, text: option.name, label: option.name, }))
        setListVthh(result)

        console.log('result', result);

    }

    const getDataForProduct = (product_id) => {
        if (!starting_date || !ending_date) {
            showDialog('', 'Vui lòng chọn thời gian')
            return
        }
        setProduct(product_id || {})
        getValuePurchaseByParner(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), price, product_id.value, branch_id.value)
    }

    const getDataForGroup = (product_id) => {
        if (!starting_date || !ending_date) {
            showDialog('', 'Vui lòng chọn thời gian')
            return
        }
        setVthh(product_id || {})
        getValuePurchaseByParner(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), price, product_id.text, vthh.text, branch_id.value)
    }


    const getDataForBranch = (branch_id) => {
        if (!starting_date || !ending_date) {
            showDialog('', 'Vui lòng chọn thời gian')
            return
        }
        setBranch_id(branch_id || {})
        getValuePurchaseByParner(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), price, product.value, vthh.text, branch_id.value)
    }


    const exportToExcel = (data, fileName = 'Giá trị mua hàng theo nhà cung cấp.xlsx') => {

        // Tạo một workbook mới
        const workbook = XLSX.utils.book_new();

        // Tạo một worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Tạo file Excel và tải xuống
        XLSX.writeFile(workbook, fileName);
    };


    useEffect(() => { onTextChangeGroup(); onTextChangeProduct() }, [])


    return (
        <>
            <Stack direction='row' alignItems='center' justifyContent='space-between' padding='8px 0' >
                <Button onClick={() => { exportToExcel(dataExport) }} color='success' size='small' variant='contained'>Xuất dữ liệu</Button>
                <Stack padding='0 32px 0 0'>
                    <Typography variant='h5'>Triệu đồng</Typography>
                </Stack>
            </Stack>
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
                        <Grid item xs={12} md={5} sm={5} lg={5} />

                        <Grid item xs={12} md={2} sm={2} lg={2}>
                            <Autocomplete
                                className='custom-autocomplete'

                                disablePortal
                                id="combo-box-demo"
                                value={vthh?.text || ''}
                                // inputValue={this.state.managerSearch}
                                onChange={(event, productId) => {
                                    getDataForGroup(productId)
                                }}
                                onInputChange={(event, value) => {
                                    if (value === '') {
                                        getValuePurchaseByParner()
                                    }
                                    onTextChangeGroup(value)
                                }}
                                options={listVthh}

                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField placeholder='chọn VTHH' variant={'outlined'}
                                        {...params} />
                                )} />
                        </Grid>

                        <Grid item xs={12} md={2} sm={2} lg={2}>
                            <Autocomplete
                                className='custom-autocomplete'

                                disablePortal
                                id="combo-box-demo"
                                value={product?.text || ''}
                                // inputValue={this.state.managerSearch}
                                onChange={(event, productId) => {
                                    getDataForProduct(productId)
                                }}
                                onInputChange={(event, value) => {
                                    if (value === '') {
                                        getValuePurchaseByParner()
                                    }
                                    onTextChangeProduct(value)

                                }}
                                options={listProduct}

                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField placeholder='chọn thiết bị' variant={'outlined'}
                                        {...params} />
                                )} />
                        </Grid>

                        <Grid item xs={12} md={2} sm={2} lg={2}>
                            <TextField
                                className='custom-textfiled'
                                sx={{ width: '100%' }}
                                variant='outlined'
                                name="name"
                                placeholder='số tiền (triệu đồng)'
                                defaultValue={price || ''}
                                onChange={({ target: { value } }) => {
                                    filterPrice(value)
                                }}
                                required
                            />
                        </Grid>

                    </Grid>
                </Box> */}

                <Box sx={{ mx: 3 }} dir="ltr">
                    <ReactApexChart type="bar" series={[{ data: chartSeries }]} options={chartOptions} height={500} />
                </Box>
            </Card>
        </>

    );
}
