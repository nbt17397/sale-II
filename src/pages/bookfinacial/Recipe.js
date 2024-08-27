import { Autocomplete, Box, Button, CardHeader, Chip, Divider, Drawer, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, alpha, styled, useMediaQuery } from '@mui/material'
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { viVN } from '@mui/x-data-grid/locales';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { createSearchParams, useNavigate } from 'react-router-dom';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue, routes } from 'src/global';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar'


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


function addPropertiesToObjects(arr) {
    return arr.map(obj => {
        switch (obj.name) {
            case "tài sản ngắn hạn":
                return { ...obj, code: 100, };
            case "tiền và khoản tiền tương đương":
                return { ...obj, code: 112, };
            case "đầu tư tài chính ngắn hạn":
                return { ...obj, code: 120, };
            case "các khoản phải thu ngắn hạn":
                return { ...obj, code: "KPTNH", };
            case "hàng tồn kho":
                return { ...obj, code: "HTK", };
            case "tài sản ngắn hạn khác":
                return { ...obj, code: "TSNHK", };
            case "Tài sản dài hạn":
                return { ...obj, code: "TSDH", };
            case "Các khoản phải thu dài hạn":
                return { ...obj, code: "KPTDH", };
            case "Tài sản cố định":
                return { ...obj, code: "TSCD", };
            case "Bất động sản đầu tư":
                return { ...obj, code: "BDSDT", };
            case "Tài sản dở dang dài hạn":
                return { ...obj, code: "TSDDH", };
            case "Đầu tư tài chính dài hạn":
                return { ...obj, code: "DTTCDH", };
            case "Tài sản dài hạn khác":
                return { ...obj, code: "TSDHK", };
            case "Nợ phải trả":
                return { ...obj, code: "NPT", };
            case "Nợ ngắn hạn":
                return { ...obj, code: "NNH", };
            case "Nợ dài hạn":
                return { ...obj, code: "NDH", };
            case "Tổng vốn chủ sở hữu":
                return { ...obj, code: "TVCSH", };
            case "Vốn chủ sở hữu":
                return { ...obj, code: "VCSH", };
            case "Nguồn kinh phí và quỹ khác":
                return { ...obj, code: 'ABC', };
            default:
                return obj;
        }
    });
}

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

const option = [
    { text: "Bảng cân đối kế toán", value: 0 },
    { text: 'Báo cáo kết quả hoạt động kinh doanh', value: 4 },
    { text: 'Báo cáo lưu chuyển tiền tệ', value: 5 },
    { text: 'Doanh thu & lợi nhuận gộp', value: 6 },
    { text: 'Chi phí bán hàng', value: 7 },
    { text: 'Chi phí quản lý', value: 8 },
    { text: 'Chỉ số kiểm soát', value: 9 },

]

const Recipe = () => {

    const { loadViews, setLoading, searchRead, showDialog, getBusinessActivities,
        getManagementExpenses, getSellingExpensess, getRevenues, getOperatingActivities, getCurrentAssetss, ownerEquity, accountsPayable, getLongTermAssets,
        getControlIndex, nameSearch, getCurrentAssetssFilter, getLongTermAssetsFilter, accountsPayableFilter, getBusinessActivitiesFilter, ownerEquityFilter,
        getControlIndexFilter, getManagementExpensesFilter, getSellingExpensessFilter, getRevenuesFilter,
        getOperatingActivitiesFilter
    } = useContext(UserContext)
    const isMobile = useMediaQuery('(max-width:600px)');
    const navigate = useNavigate()
    const [fieldOfView] = useState({})
    const [type, setType] = useState(0)
    const [recipe, setRecipe] = useState([])
    const currentYear = new Date().getFullYear()
    const beforeYear = new Date().getFullYear() - 1
    const currentMonth = new Date().getMonth() + 1;
    const beforeMonth = currentMonth === 1 ? 12 : currentMonth - 1;


    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01 00:00:00`))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01 00:00:00`).endOf('month'));
    const [before_starting_date, setBeforeStartingDate] = useState(null || moment(`${currentYear}-${beforeMonth}-01 00:00:00`))
    const [before_ending_date, setBeforeEndingDate] = useState(null || moment(`${currentYear}-${beforeMonth}-01 00:00:00`).endOf('month'));

    const [loadingData, setLoadingData] = useState(false)
    const [open, setOpen] = useState(false)
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
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })
    const [business_unit_id, setBusiness_unit_id] = useState(null)
    const [listBranch, setListBranch] = useState([])
    const [listBusiness, setListBusiness] = useState([])



    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

    // const getData = async () => {
    //     setLoading(true)
    //     const [currentAssetss, longTermAsset, accountsPayables, ownerEquitys] = await Promise.all([
    //         getCurrentAssetss(),
    //         getLongTermAssets(),
    //         accountsPayable(),
    //         ownerEquity()
    //     ])
    //     if (currentAssetss.error || longTermAsset.error || accountsPayables.error || ownerEquitys.error) {
    //         showDialog('', 'Lỗi lấy dữ liệu')
    //         setLoading(false)
    //         return
    //     }
    //     const result = [...currentAssetss.result, ...longTermAsset.result, ...accountsPayables.result, ...ownerEquitys.result]
    //     setRecipe(result)
    //     setLoadingData(false)
    //     setLoading(false)
    // };

    const handleChange = async (event) => {
        setLoadingData(true)
        const value = event.target.value
        setType(event.target.value);

        if (value === 0) {
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

            const current = [...currentAssetssF.result, ...longTermAssetF.result, ...accountsPayablesF.result, ...ownerEquitysF.result]
            const before = [...currentAssetssB.result, ...longTermAssetB.result, ...accountsPayablesB.result, ...ownerEquitysB.result]
            const result = current.map(obj => {
                const beforeObj = before.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            console.log('result', result);
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
        if (value === 4) {
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

            console.log('result', result);
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
        if (value === 5) {
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
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
        if (value === 6) {
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
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
        if (value === 7) {
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
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
        if (value === 8) {
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
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
        if (value === 9) {
            const [current, before] = await Promise.all([
                getControlIndexFilter(branch_id?.value || false, business_unit_id?.value || false, moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT)),
                getControlIndexFilter(branch_id?.value || false, business_unit_id?.value || false, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setLoadingData(false)
            setOpen(false)
        }
    };

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


    const handlefilter = async (branch, business, start, end, before_starting_date, before_ending_date) => {
        setLoading(true)
        if (type === 0) {
            const [currentAssetssF, longTermAssetF, accountsPayablesF, ownerEquitysF, currentAssetssB, longTermAssetB, accountsPayablesB, ownerEquitysB] = await Promise.all([
                getCurrentAssetssFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getLongTermAssetsFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                accountsPayableFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                ownerEquityFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),

                getCurrentAssetssFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
                getLongTermAssetsFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
                accountsPayableFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
                ownerEquityFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),

            ])

            const current = [...currentAssetssF.result, ...longTermAssetF.result, ...accountsPayablesF.result, ...ownerEquitysF.result]
            const before = [...currentAssetssB.result, ...longTermAssetB.result, ...accountsPayablesB.result, ...ownerEquitysB.result]
            const result = current.map(obj => {
                const beforeObj = before.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }

        if (type === 4) {
            const [current, before] = await Promise.all([
                getBusinessActivitiesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getBusinessActivitiesFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            console.log('current', current.result, 'before', before.result, result);

            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }
        if (type === 5) {
            const [current, before] = await Promise.all([
                getOperatingActivitiesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getOperatingActivitiesFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }
        if (type === 6) {
            const [current, before] = await Promise.all([
                getRevenuesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getRevenuesFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }
        if (type === 7) {
            const [current, before] = await Promise.all([
                getSellingExpensessFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getSellingExpensessFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }
        if (type === 8) {
            const [current, before] = await Promise.all([
                getManagementExpensesFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getManagementExpensesFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }
        if (type === 9) {
            const [current, before] = await Promise.all([
                getControlIndexFilter(branch, business, moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT)),
                getControlIndexFilter(branch, business, moment(before_starting_date).format(DATE_TIME_FORMAT), moment(before_ending_date).format(DATE_TIME_FORMAT)),
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setRecipe(result)
            setLoading(false)
            setOpen(false)
        }
    }


    const handleChangeTime = (event, value) => {
        console.log('value', value);
        setTime(value);
        if (value) {
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
        } else {
            setStartingDate(null);
            setEndingDate(null);
        }
    };


    const columns = [
        // { field: 'id', headerName: '#', width: 90 },

        {
            field: 'name',
            headerName: getLabel(type === 0 ? 'Chỉ tiêu' : 'Tên'),
            renderCell: (params) =>
                params?.row?.name || '',
            flex: 1
        },
        type === 0 ? {
            field: 'code', headerName: 'Mã số', align: 'center', headerAlign: 'center'
        } : null,

        // type === 0 ? {
        //     field: 'getData', headerName: 'Cách lấy dữ liệu', flex: 0.5, align: 'center', headerAlign: 'center'
        // } : null,
        {
            field: 'formula',
            headerName: getLabel('Công thức'),
            renderCell: (params) =>
                params?.row?.formula || '',
            flex: 1

        },

        {
            field: 'value',
            headerName: getLabel(type === 0 ? 'Số cuối kỳ' : 'Giá trị'),
            align: 'right', headerAlign: 'right',
            flex: 0.5,
            renderCell: (params) =>
                !params?.row?.value ? '' : formatterRevenue.format(params?.row?.value || ''),
        },
        type === 0 ? {
            field: 'before', headerName: 'Số đầu kỳ', align: 'right', headerAlign: 'right',
            flex: 0.5,
            renderCell: (params) =>
                !params?.row?.before ? '' : formatterRevenue.format(params?.row?.before || ''),
        } : null,



    ].filter((column) => column !== null);

    const dataMemo = useMemo(() => recipe.map((item, index) => ({ id: index, key: item.id, ...item })), [recipe])

    const handleRowClick = (id = '') => {
        navigate({ pathname: routes.DetailAccoutingFinacial.path, search: createSearchParams({ id }).toString() });
    };



    useEffect(() => {
        // getData()
        onTextChangeBranch()
        onTextChangeUnit()
    }, [])

    return (
        <>
            <Helmet>
                <title> Sổ chi tài khoản kế toán </title>
            </Helmet>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', transform: 'translateZ(0px)', flexGrow: 1 }}>
                <HeaderToolbar
                    routeName="Công thức"
                // Truyền vào một mảng rỗng nếu không có actions
                />
                <Box sx={{ maxHeight: isMobile ? '100vh' : 'calc(100vh - 240px)', overflow: isMobile ? 'unset' : 'auto', backgroundColor: 'white', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Stack direction='row' alignItems='center'>
                        <CardHeader sx={{ padding: '16px' }} title='Danh Sách Công Thức' />
                    </Stack>
                    <Box padding='8px' borderRadius='4px' width='100%'>
                        <Grid container spacing={3}  >
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
                                        >
                                            {option.map((x) => (<MenuItem key={x.value} value={x.value}>{x.text}</MenuItem>
                                            ))}

                                        </Select>
                                    </FormControl>
                                    <Button onClick={() => { setOpen(true) }} sx={{ width: '16%', boxShadow: 'none' }} variant='contained'>Lọc dữ liệu</Button>
                                </Stack>
                            </Grid>

                            <Stack direction='row' gap='16px' padding='24px'>
                                {starting_date ? <Chip label={`Bắt đầu ${moment(starting_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null}
                                {ending_date ? <Chip label={`Kết thúc ${moment(ending_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null}
                                {branch_id && <Chip label={`${branch_id.text}`} />}
                                {business_unit_id && <Chip label={`${business_unit_id.text}`} />}
                            </Stack>
                        </Grid>
                        <Divider />

                    </Box>
                    <Box width='100%' >
                        <StripedDataGrid
                            sx={{
                                [`& .${gridClasses.cell}`]: {
                                    py: 1
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    textOverflow: "clip",
                                    whiteSpace: "break-spaces",
                                    lineHeight: 1
                                }, border: 0
                            }}
                            getRowHeight={() => 'auto'}
                            loading={loadingData}
                            hideFooter
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
                            onRowClick={(row) => {
                                handleRowClick(row.id);
                            }}
                            getRowClassName={(params) =>
                                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                            }
                            getCellClassName={(params) => {
                                const { name } = params.row;

                                // Kiểm tra chỉ mục trong tên
                                if (name) {
                                    // Các chỉ mục bắt đầu bằng 'A.' hoặc 'B.'
                                    if (name.startsWith('A.') || name.startsWith('B.')) {
                                        return 'row-blue'; // Trả về class CSS cho màu xanh
                                    }
                                    // Các chỉ mục bắt đầu bằng 'I.', 'II.', 'III.', ...
                                    if (/^[IVX]+\.\s/.test(name)) {
                                        return 'row-yellow'; // Trả về class CSS cho màu vàng
                                    }
                                }

                                return ''; // Trả về chuỗi rỗng nếu không phù hợp
                            }}
                        />
                    </Box>
                </Box>
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
                        <Button onClick={() => { handlefilter(branch_id?.value || false, business_unit_id?.value || false, starting_date, ending_date, before_starting_date, before_ending_date) }}
                            variant='contained' color='success' sx={{ boxShadow: 'none' }}>Xác nhận</Button>
                    </Stack>
                </Stack>
            </Drawer>
        </>
    )
}

export default Recipe
