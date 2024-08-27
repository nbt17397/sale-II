import { Autocomplete, Box, Button, Chip, Container, Divider, Drawer, FormControl, Grid, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, Stack, TextField, Typography, useMediaQuery } from '@mui/material'
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { viVN } from '@mui/x-data-grid/locales';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { alpha, styled } from '@mui/material/styles';

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global';
import * as XLSX from 'xlsx';

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
    const beforeEndDate = new Date(date.getFullYear(), date.getMonth(), 0, 16, 59, 59);



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
    const beforeEndDate = new Date(endYearBefore, adjustedEndMonthBefore, new Date(endYearBefore, adjustedEndMonthBefore + 1, 0).getDate(), 16, 59, 59);

    return {
        startDate,
        endDate,
        beforeStartDate,
        beforeEndDate
    };
}


function getPreviousMonthRange(startTime, endTime) {
    // Chuyển đổi thời gian bắt đầu và kết thúc thành đối tượng Date
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Lấy tháng, năm của thời gian bắt đầu và kết thúc
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const endMonth = end.getMonth();
    const endYear = end.getFullYear();

    // Tạo đối tượng Date cho ngày đầu tiên của tháng trước
    let prevMonthStart = new Date(startYear, startMonth - 1, start.getDate(), 0, 0, 0);
    // Tạo đối tượng Date cho ngày cuối cùng của tháng trước
    let prevMonthEnd = new Date(endYear, endMonth - 1, end.getDate(), 23, 59, 59);

    // Kiểm tra nếu ngày không tồn tại trong tháng trước, thì lấy ngày cuối cùng của tháng
    const lastDayOfPrevMonthStart = new Date(startYear, startMonth, 0).getDate();
    if (start.getDate() > lastDayOfPrevMonthStart) {
        prevMonthStart = new Date(startYear, startMonth - 1, lastDayOfPrevMonthStart, 0, 0, 0);
    }

    const lastDayOfPrevMonthEnd = new Date(endYear, endMonth, 0).getDate();
    if (end.getDate() > lastDayOfPrevMonthEnd) {
        prevMonthEnd = new Date(endYear, endMonth - 1, lastDayOfPrevMonthEnd, 16, 59, 59);
    }

    return {
        beforeStartTime: prevMonthStart.getTime(),
        beforeEndTime: prevMonthEnd.getTime()
    };
}

const options = [
    { text: "Sổ chi tiết mua hàng", value: 1 },
    { text: "Bảng cân đối kế toán", value: 2 },
    { text: 'Báo cáo kết quả hoạt động kinh doanh', value: 3 },
    { text: 'Báo cáo lưu chuyển tiền tệ', value: 4 },
    { text: 'Doanh thu & lợi nhuận gộp', value: 5 },
    { text: 'Chi phí bán hàng', value: 6 },
    { text: 'Chi phí quản lý', value: 7 },
    { text: 'Chỉ số kiểm soát', value: 8 },

]



const Report = () => {



    const { searchRead, showDialog, nameSearch, setLoading, getCurrentAssetss, getLongTermAssets,
        accountsPayable, ownerEquity, getBusinessActivities, getOperatingActivities, getCurrentAssetssFilter,
        getLongTermAssetsFilter, accountsPayableFilter, ownerEquityFilter, getBusinessActivitiesFilter,
        getOperatingActivitiesFilter, getControlIndexFilter, getManagementExpensesFilter, getSellingExpensessFilter,
        getRevenuesFilter
    } = useContext(UserContext)
    const [fieldOfView, setFieldOfView] = useState({})

    const currentYear = new Date().getFullYear()
    const beforeYear = new Date().getFullYear() - 1
    const currentMonth = new Date().getMonth() + 1;
    const beforeMonth = currentMonth === 1 ? 12 : currentMonth - 1;


    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01 00:00:00`))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 16).set('minute', 59).set('second', 59));
    console.log('ending_date', ending_date);
    const [before_starting_date, setBeforeStartingDate] = useState(null || moment(`${currentYear}-${beforeMonth}-01 00:00:00`))
    const [before_ending_date, setBeforeEndingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 16).set('minute', 59).set('second', 59));
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })
    const [data, setData] = useState([])
    const [dataExport, setDataExport] = useState([])
    const [product, setProduct] = useState(null)
    const [price, setPrice] = useState(0)
    const [listBranch, setListBranch] = useState([])
    const [business_unit_id, setBusiness_unit_id] = useState({})
    const [listBusiness, setListBusiness] = useState([])
    const [listProduct, setListProduct] = useState([])
    const [vthh, setVthh] = useState(null)
    const [listVthh, setListVthh] = useState([])
    const [loadingData, setLoadingData] = useState(false)
    const [type, setType] = useState(0)
    const [open, setOpen] = useState(false)
    const [custom, setCustom] = useState(true)
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
        { value: null, text: 'Tùy chọn', label: 'Tùy chọn' }

    ])


    const isMobile = useMediaQuery('(max-width:600px)');
    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);


    const onTextChangeBranch = async (value = '') => {
        const json = await nameSearch('res.company.modify', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        setListBranch(result)
    }

    const onTextChangeUnit = async (value = '') => {
        const json = await nameSearch('business.unit', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        setListBusiness(result)
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


    const getData = async (starting_date, ending_date, price, product, vthh, branch_id) => {
        const currentYear = new Date().getFullYear()

        const filters = [
            ["payment_date", ">=", starting_date || `${currentYear}-${currentMonth}-01 00:00:00`],
            ["payment_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 16).set('minute', 59).set('second', 59).format(DATE_TIME_FORMAT)],
            ['branch_id', '=', branch_id || 1]
        ];
        if (vthh) {
            filters.push(["product_categ_name", "=", vthh]);
        }
        if (product) {
            filters.push(["product_code", "=", product]);
        }
        if (price) {
            filters.push(["price_total", ">=", price]);
        }

        const json = await searchRead('account.purchase.report.line', ['product_code', 'qty_purchased', 'price_total', 'product_categ_name'], filters)

        if (json.error) {
            showDialog('', 'Lỗi lấy dữ liệu')
            setLoadingData(false)
            return
        }

        const result = Object.values(json.result.records.reduce((acc, curr) => {
            const key = curr.product_code;
            if (!acc[key]) {
                acc[key] = { product_code: key, qty_purchased: 0, price_total: 0 };
            }
            acc[key].qty_purchased += curr.qty_purchased;
            acc[key].price_total += curr.price_total;
            return acc;
        }, {}));

        setData(result)
        const exp = result.map((x) => ({ 'Mã sản phẩm': x.product_code, 'Số lượng': x.qty_purchased, 'Giá trị': x.price_total }))
        setDataExport(exp)
        setLoadingData(false)

    }





    const handleChangeTime = (event, value) => {
        console.log('value', value);
        setTime(value);
        if (value.value === null || value.value === undefined) {
            setCustom(false)
            setEndingDate(null)
            setStartingDate(null)
            setBeforeEndingDate(null)
            setBeforeStartingDate(null)
        }
        else if (value) {
            const currentYear = new Date().getFullYear();

            if (value.value < 12) {
                // Nếu là tháng
                const { startDate, endDate, beforeStartDate, beforeEndDate } = getMonthRange(value.value, currentYear);
                setStartingDate(moment(startDate))
                setEndingDate(moment(endDate))
                setBeforeStartingDate(moment(beforeStartDate))
                setBeforeEndingDate(moment(beforeEndDate))
                console.log('beforeStartDate, beforeEndDate', beforeStartDate, beforeEndDate);

                console.log('startDate', moment(endDate), (moment(startDate)))

            } else if (value.value >= 12 && value.value <= 15) {
                // Nếu là quý
                const quarter = value.value - 11;
                const { startDate, endDate, beforeStartDate, beforeEndDate } = getQuarterRange(quarter, currentYear);
                setStartingDate(moment(startDate));
                setEndingDate(moment(endDate));
                setBeforeStartingDate(moment(beforeStartDate))
                setBeforeEndingDate(moment(beforeEndDate))
            } else {
                // Nếu là năm
                setStartingDate(moment(new Date(currentYear, 0, 1)));
                setEndingDate(moment(new Date(currentYear, 11, 31, 23, 59, 59)));
                setBeforeStartingDate(moment(new Date(beforeYear, 0, 1)));
                setBeforeEndingDate(moment(new Date(beforeYear, 11, 31, 23, 59, 59)));
            }
            setCustom(true)
        }
        else {
            setEndingDate(null)
            setStartingDate(null);
        }
    };

    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        type === 0 ? {
            field: 'product_code',
            headerName: getLabel('Mã sản phẩm'),
            renderCell: (params) =>
                params?.row?.product_code || '',
            flex: 1
        } : null,

        type === 0 ? {
            field: 'qty_purchased',
            headerName: getLabel('Số lượng'),
            renderCell: (params) =>
                params?.row?.qty_purchased || '',
        } : null,

        type === 0 ? {
            field: 'price_total',
            headerName: getLabel('Giá trị'),
            renderCell: (params) =>
                formatterRevenue.format(params?.row?.price_total || ''),
        } : null,

        type !== 0 ? {
            field: 'name', headerName: 'Chi tiêu', flex: 1, align: 'left', headerAlign: 'left'
        } : null,

        type !== 0 && type < 4 ? {
            field: 'code', headerName: 'Mã số', align: 'center', headerAlign: 'center',

        } : null,

        type !== 0 && type < 4 ? {
            field: 'description',
            headerName: getLabel('Thuyết minh'),
            align: 'center', headerAlign: 'center',
            renderCell: (params) =>
                params?.row?.description || '',
        } : null,

        type !== 0 ? {
            field: 'value',
            headerName: getLabel('Số cuối kỳ'),
            align: 'right', headerAlign: 'right',
            flex: 0.4,
            renderCell: (params) =>
                <Typography variant='body2' color={params.row.value < 0 ? 'red' : 'black'}>
                    {params.row.value < 0 ? `(${formatterRevenue.format(params?.row?.value < 0 ? params?.row?.value * -1 : params?.row?.value || '')})` :
                        params?.row?.value === false ? '' : formatterRevenue.format(params?.row?.value || 0)
                    }
                </Typography>
        } : null,



        type !== 0 ? {
            field: 'before', headerName: 'Số đầu kỳ', align: 'right', headerAlign: 'right',
            flex: 0.4,
            renderCell: (params) =>
                <Typography variant='body2' color={params.row.before < 0 ? 'red' : 'black'}>
                    {params.row.before < 0 ? `(${formatterRevenue.format(params?.row?.before < 0 ? params?.row?.before * -1 : params?.row?.before || '')})` :
                        params?.row?.before === false ? '' : formatterRevenue.format(params?.row?.before || 0)
                    }
                </Typography>
        } : null,

    ].filter((column) => column !== null)

    const dataMemo = useMemo(() => data.map((x, index) => ({ id: index, ...x })), [data])

    console.log('dataMemo', dataMemo);


    const setDate = () => {
        setStartingDate(moment(`${currentYear}-${currentMonth}-01 00:00:00`))
        setEndingDate(moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 17).set('minute', 59).set('second', 59))
        setTime({})
    }

    const handleChange = async (event) => {
        setDate()
        setLoading(true)
        const value = event.target.value
        setType(event.target.value);

        if (value === 1) {
            await getData();
            setLoading(false)
        }

        if (value === 2) {
            const [currentAssetssF, longTermAssetF, accountsPayablesF, ownerEquitysF, currentAssetssB, longTermAssetB, accountsPayablesB, ownerEquitysB] = await Promise.all([
                getCurrentAssetssFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getLongTermAssetsFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                accountsPayableFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                ownerEquityFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),

                getCurrentAssetssFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
                getLongTermAssetsFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
                accountsPayableFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
                ownerEquityFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),

            ])


            const ab = [...currentAssetssF.result, ...longTermAssetF.result]

            const abCurrentAssets = ab.find(item => item.name === 'A. Tài sản ngắn hạn');
            const abLongTermAssets = ab.find(item => item.name === 'B. Tài sản dài hạn');

            const abTotal = {
                description: '',
                code: 270,
                name: `TỔNG TÀI SẢN (270 = ${abCurrentAssets.code} + ${abLongTermAssets.code})`,
                formula: '',
                value: abCurrentAssets.value + abLongTermAssets.value
            };

            ab.push(abTotal);

            const cd = [...accountsPayablesF.result, ...ownerEquitysF.result]
            const cdAccountsPayables = cd.find(item => item.name === 'C. Nợ phải trả');
            const cdOwnerEquitys = cd.find(item => item.name === 'D. Tổng vốn chủ sở hữu');

            const cdTotal = {
                description: '',
                code: 440,
                name: `TỔNG CỘNG NGUỒN VỐN (440 = ${cdAccountsPayables.code} + ${cdOwnerEquitys.code})`,
                formula: '',
                value: cdAccountsPayables.value + cdOwnerEquitys.value
            };

            cd.push(cdTotal);

            const ef = [...currentAssetssB.result, ...longTermAssetB.result,]

            const efCurrentAssets = ef.find(item => item.name === 'A. Tài sản ngắn hạn');
            const efLongTermAssets = ef.find(item => item.name === 'B. Tài sản dài hạn');

            const efTotal = {
                description: '',
                code: 270,
                name: `TỔNG TÀI SẢN (270 = ${efCurrentAssets.code} + ${efLongTermAssets.code})`,
                formula: '',
                value: efCurrentAssets.value + efLongTermAssets.value
            };

            ef.push(efTotal);


            const gh = [...accountsPayablesB.result, ...ownerEquitysB.result]

            const ghAccountsPayables = gh.find(item => item.name === 'C. Nợ phải trả');
            const ghOwnerEquitys = gh.find(item => item.name === 'D. Tổng vốn chủ sở hữu');

            const ghTotal = {
                description: '',
                code: 440,
                name: `TỔNG CỘNG NGUỒN VỐN (440 = ${ghAccountsPayables.code} + ${ghOwnerEquitys.code})`,
                formula: '',
                value: ghAccountsPayables.value + ghOwnerEquitys.value
            };

            console.log('ghOwnerEquitys', ghOwnerEquitys);



            gh.push(ghTotal);

            const current = [...ab, ...cd]
            const before = [...ef, ...gh]
            console.log(before, 'before');
            const result = current.map(obj => {
                const beforeObj = before.find(item => item.code === obj.code);
                console.log('');
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            console.log('result', result);
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)

            setLoading(false)
            setOpen(false)
        }

        if (value === 3) {
            console.log('before_ending_date', moment('2024-4-31 23:59:58').format(DATE_TIME_FORMAT_TO_DISPLAY));
            const [current, before] = await Promise.all([
                getBusinessActivitiesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getBusinessActivitiesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            console.log('current', current.result, 'before', before.result, result);

            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }

        if (value === 4) {
            console.log('before_ending_date', before_ending_date);
            const [current, before] = await Promise.all([
                getOperatingActivitiesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getOperatingActivitiesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)


            setLoading(false)
            setOpen(false)
        }
        if (value === 5) {
            const [current, before] = await Promise.all([
                getRevenuesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getRevenuesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)

            setLoading(false)
            setOpen(false)
        }
        if (value === 6) {
            const [current, before] = await Promise.all([
                getSellingExpensessFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getSellingExpensessFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (value === 7) {
            const [current, before] = await Promise.all([
                getManagementExpensesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getManagementExpensesFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (value === 8) {
            const [current, before] = await Promise.all([
                getControlIndexFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getControlIndexFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
            ])

            const filteredCurrent = current.result.filter(obj => Number.isInteger(obj.code));
            const filteredBefore = before.result.filter(obj => Number.isInteger(obj.code));


            const result = filteredCurrent.map(obj => {
                const beforeObj = filteredBefore.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
    };

    const handleInputChange = (event, newInputValue) => {
        console.log('handleInputChange called with:', newInputValue);
        if (newInputValue === '') {
            console.log('Input is empty');
            showDialog('Thông báo', 'Vui lòng chọn thời gian để xem kết quả')
        }
    };

    const exportToExcel = (data, fileName = 'data.xlsx') => {
        console.log('data', data);
        // Tạo một workbook mới
        const workbook = XLSX.utils.book_new();

        // Tạo một worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Tạo file Excel và tải xuống
        XLSX.writeFile(workbook, fileName);
    };

    const handlefilter = async (branch, business, start, end, before_starting, before_ending) => {

        setLoading(true)
        if (type === 1) {
            getData(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), price, product?.text || false, vthh?.text || false, branch_id?.value || false)
            setLoading(false)
            setOpen(false)
        }
        if (type === 2) {
            const [currentAssetssF, longTermAssetF, accountsPayablesF, ownerEquitysF, currentAssetssB, longTermAssetB, accountsPayablesB, ownerEquitysB] = await Promise.all([
                getCurrentAssetssFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getLongTermAssetsFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                accountsPayableFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                ownerEquityFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),

                getCurrentAssetssFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),
                getLongTermAssetsFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),
                accountsPayableFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),
                ownerEquityFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),
            ])



            const ab = [...currentAssetssF.result, ...longTermAssetF.result]

            const abCurrentAssets = ab.find(item => item.name === 'A. Tài sản ngắn hạn');
            const abLongTermAssets = ab.find(item => item.name === 'B. Tài sản dài hạn');

            const abTotal = {
                description: '',
                code: 270,
                name: `TỔNG TÀI SẢN (270 = ${abCurrentAssets.code} + ${abLongTermAssets.code})`,
                formula: '',
                value: abCurrentAssets.value + abLongTermAssets.value
            };

            ab.push(abTotal);

            const cd = [...accountsPayablesF.result, ...ownerEquitysF.result]
            const cdAccountsPayables = cd.find(item => item.name === 'C. Nợ phải trả');
            const cdOwnerEquitys = cd.find(item => item.name === 'D. Tổng vốn chủ sở hữu');

            const cdTotal = {
                description: '',
                code: 440,
                name: `TỔNG CỘNG NGUỒN VỐN (440 = ${cdAccountsPayables.code} + ${cdOwnerEquitys.code})`,
                formula: '',
                value: cdAccountsPayables.value + cdOwnerEquitys.value
            };

            cd.push(cdTotal);

            const ef = [...currentAssetssB.result, ...longTermAssetB.result,]

            const efCurrentAssets = ef.find(item => item.name === 'A. Tài sản ngắn hạn');
            const efLongTermAssets = ef.find(item => item.name === 'B. Tài sản dài hạn');

            const efTotal = {
                description: '',
                code: 270,
                name: `TỔNG TÀI SẢN (270 = ${efCurrentAssets.code} + ${efLongTermAssets.code})`,
                formula: '',
                value: efCurrentAssets.value + efLongTermAssets.value
            };

            ef.push(efTotal);


            const gh = [...accountsPayablesB.result, ...ownerEquitysB.result]

            const ghAccountsPayables = gh.find(item => item.name === 'C. Nợ phải trả');
            const ghOwnerEquitys = gh.find(item => item.name === 'D. Tổng vốn chủ sở hữu');

            const ghTotal = {
                description: '',
                code: 270,
                name: `TỔNG CỘNG NGUỒN VỐN (440 = ${ghAccountsPayables.code} + ${ghOwnerEquitys.code})`,
                formula: '',
                value: ghAccountsPayables.value + ghOwnerEquitys.value
            };

            gh.push(ghTotal);

            const current = [...ab, ...cd]
            const before = [...ef, ...gh]
            const result = current.map(obj => {
                const beforeObj = before.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }

        if (type === 3) {
            const [current, before] = await Promise.all([
                getBusinessActivitiesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getBusinessActivitiesFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            console.log('current', current.result, 'before', before.result, result);

            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (type === 4) {
            const [current, before] = await Promise.all([
                getOperatingActivitiesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getOperatingActivitiesFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (type === 5) {
            const [current, before] = await Promise.all([
                getRevenuesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getRevenuesFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (type === 6) {
            const [current, before] = await Promise.all([
                getSellingExpensessFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getSellingExpensessFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (type === 7) {
            const [current, before] = await Promise.all([
                getManagementExpensesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getManagementExpensesFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }
        if (type === 8) {
            const [current, before] = await Promise.all([
                getControlIndexFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getControlIndexFilter(branch, business, moment(before_starting).format(DATE_TIME_FORMAT), moment(before_ending).format(DATE_TIME_FORMAT)),
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            const exp = result.map((x) => ({ 'Chỉ tiêu': x.name, 'Mã số': x.code, 'Thuyết minh': x.description, 'Số đầu kỳ': x.value === false ? '' : x.value, 'Số cuối kỳ': x.before === false ? '' : x.before }))
            setDataExport(exp)
            setLoading(false)
            setOpen(false)
        }


    }


    const changeDataByPathMemo = useMemo(() => {
        const path = window.location.pathname;
        console.log('path', path);

        if (path.includes('report')) {
            return options.filter(option => [2, 3, 4, 5, 6, 7, 8].includes(option.value));
        }
        if (path.includes('selling')) {
            return options.filter(option => [1].includes(option.value));
        }
        return options;
    }, [window.location.pathname]);

    console.log('changeDataByPathMemo', changeDataByPathMemo);

    useEffect(() => {
        setType(0)
        getData();
        onTextChangeProduct();
        onTextChangeGroup();
        onTextChangeBranch();
        onTextChangeUnit();
    }, [])

    useEffect(() => {
        console.log('window.location.pathname', window.location.pathname);
        if (window.location.pathname === '/report') {
            const code = { target: { value: 2 } }
            handleChange(code)
        }
        if (window.location.pathname === '/selling') {
            const code = { target: { value: 1 } }
            handleChange(code)
        }
    }, [window.location.pathname])

    return (
        <>
            <Helmet>
                <title>Báo cáo</title>
            </Helmet>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={12} md={12}>
                    <Box sx={{

                        backgroundColor: 'white', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '16px'
                    }}>
                        <Stack direction='column' gap='8px' width='100%'>
                            <Typography variant='h6'>Báo cáo</Typography>
                            <Divider />
                        </Stack>

                        <Box padding='8px'
                            borderRadius='4px'>
                            <Grid container spacing={2}  >

                                <Grid item xs={12} md={12} sm={12} lg={12}>
                                    <Stack width='100%' direction='row' gap='16px'>
                                        <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">Loại</InputLabel>
                                            <Select
                                                size='small'
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={type}
                                                label="type"
                                                onChange={handleChange}
                                                sx={{ backgroundColor: '#EBEFFF' }}
                                            >
                                                {changeDataByPathMemo.map((x) => (<MenuItem key={x.value} value={x.value}>{x.text}</MenuItem>
                                                ))}

                                            </Select>
                                        </FormControl>
                                        <Button onClick={() => { setOpen(true) }} sx={{ width: '12%', boxShadow: 'none' }} variant='contained'>Lọc dữ liệu</Button>
                                        <Button onClick={() => { exportToExcel(dataExport) }} sx={{ width: '12%', boxShadow: 'none' }}
                                            color='success' variant='contained'>Xuất dữ liệu</Button>
                                    </Stack>

                                </Grid>
                                <Stack direction='row' gap='16px' padding='16px'>
                                    {starting_date ? <Chip label={`Bắt đầu ${moment(starting_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null}
                                    {ending_date ? <Chip label={`Kết thúc ${moment(ending_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null}
                                    {branch_id && <Chip label={`${branch_id.text}`} />}
                                    {vthh && <Chip label={`${vthh.text}`} />}
                                    {product && <Chip label={`${product.text}`} />}
                                    {price ? <Chip label={`${price}`} /> : null}
                                </Stack>
                            </Grid>
                            <Divider />
                        </Box>
                    </Box>
                </Grid>
            </Grid >
            <Box maxWidth='calc(100vw)' sx={{ maxHeight: 'calc(100vh - 340px)', overflow: 'auto', backgroundColor: 'white', padding: '16px', borderRadius: '4px', }}>
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
                    loading={loadingData}
                    className="custom-dataGrid"
                    rows={dataMemo}
                    columns={columns}
                    pageSize={10}
                    autoHeight {...dataMemo}
                    initialState={{
                        ...dataMemo.initialState,
                        pagination: { paginationModel: { pageSize: 100 } },
                    }}
                    localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    }
                    getCellClassName={(params) => {
                        const { name, code } = params.row;

                        // Kiểm tra chỉ mục trong tên
                        if (name) {
                            // Các chỉ mục bắt đầu bằng 'A.' hoặc 'B.'
                            if (name.startsWith('A.') || name.startsWith('B.') || name.startsWith('C.') || name.startsWith('D.')) {
                                return 'row-blue'; // Trả về class CSS cho màu xanh
                            }
                            // Các chỉ mục bắt đầu bằng 'I.', 'II.', 'III.', ...
                            if (/^[IVX]+\.\s/.test(name)) {
                                return 'row-yellow'; // Trả về class CSS cho màu vàng
                            }
                            if (code === 270 || code === 440) {
                                return 'row-bold'
                            }
                        }
                        return ''; // Trả về chuỗi rỗng nếu không phù hợp
                    }}
                />
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

                        {type === 0 ? null :
                            <>
                                < Grid xs={12} md={4} sm={4} lg={4} />
                                <Grid item xs={12} md={8} sm={8} lg={8}>
                                    <Stack direction='column'>
                                        <Typography variant='caption'>Mã thống kê</Typography>
                                        <Autocomplete
                                            className='custom-autocomplete'
                                            disablePortal
                                            id="combo-box-demo"
                                            value={business_unit_id?.text || ''}
                                            // inputValue={this.state.managerSearch}
                                            onChange={(event, branchId) => {
                                                setBusiness_unit_id(branchId)
                                            }}
                                            options={listBusiness}

                                            sx={{ width: '100%' }}
                                            renderInput={(params) => (
                                                <TextField placeholder='Chọn mã thống kê'
                                                    variant={'outlined'}
                                                    {...params} />
                                            )} />
                                    </Stack>
                                </Grid>
                            </>
                        }



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
                                    onInputChange={(event, newInputValue) => handleInputChange(event, newInputValue)}
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
                                    disabled={custom}
                                    className='custom-template'
                                    size="small"
                                    variant='standard'
                                    format={DATE_FORMAT_TO_DISPLAY}
                                    onChange={(date) => {

                                        setStartingDate(date)
                                    }}
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
                                    disabled={custom}
                                    className='custom-template'
                                    size="small"
                                    format={DATE_FORMAT_TO_DISPLAY}
                                    onChange={(date) => {
                                        setEndingDate(date);
                                        const { beforeStartTime, beforeEndTime } = getPreviousMonthRange(starting_date, date)
                                        setBeforeStartingDate(moment(beforeStartTime))
                                        setBeforeEndingDate(moment(beforeEndTime))
                                    }}
                                    value={ending_date}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                        },
                                    }}
                                />
                            </Stack>
                        </Grid>

                        {type > 0 ? null :
                            <>
                                <Grid item xs={12} md={12} sm={12} lg={12}>
                                    <Stack direction='column'>
                                        <Typography variant='caption'>VTHH</Typography>
                                        <Autocomplete
                                            className='custom-autocomplete'

                                            disablePortal
                                            id="combo-box-demo"
                                            value={vthh?.text || ''}
                                            // inputValue={this.state.managerSearch}
                                            onChange={(event, productId) => {
                                                // getDataForGroup(productId)
                                                setVthh(productId)
                                            }}
                                            onInputChange={(event, value) => {
                                                if (value === '') {
                                                    getData()
                                                }
                                                setVthh(value)
                                                // onTextChangeGroup(value)
                                            }}
                                            options={listVthh}

                                            sx={{ width: '100%' }}
                                            renderInput={(params) => (
                                                <TextField placeholder='chọn VTHH' variant={'outlined'}
                                                    {...params} />
                                            )} />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={6} sm={6} lg={6}>
                                    <Stack direction='column'>
                                        <Typography variant='caption'>Thiết bị</Typography>
                                        <Autocomplete
                                            className='custom-autocomplete'

                                            disablePortal
                                            id="combo-box-demo"
                                            value={product?.text || ''}
                                            // inputValue={this.state.managerSearch}
                                            onChange={(event, productId) => {
                                                setProduct(productId)
                                                // getDataForProduct(productId)
                                            }}
                                            onInputChange={(event, value) => {
                                                if (value === '') {
                                                    getData()
                                                }
                                                onTextChangeProduct(value)

                                            }}
                                            options={listProduct}

                                            sx={{ width: '100%' }}
                                            renderInput={(params) => (
                                                <TextField placeholder='chọn thiết bị' variant={'outlined'}
                                                    {...params} />
                                            )} />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={6} sm={6} lg={6}>
                                    <Stack direction='column'>
                                        <Typography variant='caption'>Trong khoảng</Typography>
                                        <TextField
                                            size='small'
                                            className='custom-textfiled'
                                            sx={{ width: '100%' }}
                                            variant='outlined'
                                            name="name"
                                            placeholder='số tiền (triệu đồng)'
                                            defaultValue={price || ''}
                                            onChange={({ target: { value } }) => {
                                                setPrice(value)
                                                // filterPrice(value)
                                            }}
                                            required
                                        />
                                    </Stack>
                                </Grid>

                            </>}
                    </Grid>
                    <Stack direction='row-reverse' width='100%'>
                        <Button onClick={() => { handlefilter(branch_id?.value || false, business_unit_id?.value || false, starting_date, ending_date, before_starting_date, before_ending_date) }}
                            variant='contained' color='success' sx={{ boxShadow: 'none' }}>Xác nhận</Button>
                    </Stack>
                </Stack>
            </Drawer>
        </>
    )
}
export default Report
