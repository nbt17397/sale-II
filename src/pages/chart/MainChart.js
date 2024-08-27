import { useState, useContext, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Grid, useMediaQuery, FormControl, InputLabel, MenuItem, Select, Grow, useTheme, Stack, Button, Autocomplete, Drawer, Typography, Divider, TextField, Chip } from '@mui/material'
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, fakeData, formatterRevenue } from 'src/global';
import AppValuePurchase from 'src/sections/@dashboard/app/AppValuePurchase';
import AppValueParner from 'src/sections/@dashboard/app/AppValueParner';
import moment from 'moment';
import ObjectiveChart from 'src/sections/@dashboard/app/ObjectiveChart';
import { v4 } from 'uuid';
import { AppCurrentVisits } from 'src/sections/@dashboard/app';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AppPlanSales } from 'src/sections/@dashboard/app/AppPlanSales';
import AppTotalBusiness from 'src/sections/@dashboard/app/AppTotalBusiness';
import { set } from 'lodash';
import AppBusinessOfYear from 'src/sections/@dashboard/app/AppBusinessOfYear';
import AppBusinessActivity from 'src/sections/@dashboard/app/AppBusinessActivity';

const colors = [
    '#FF6384', // Hồng
    '#36A2EB', // Xanh dương
    '#FFCE56', // Vàng
    '#4BC0C0', // Xanh lá cây
    '#9966FF', // Tím
    '#FF9F40', // Cam
    '#FF6384', // Đỏ nhạt
    '#C9CBCF'  // Xám
];





function getMonthRange(month, year) {
    // Tạo đối tượng Date từ năm và tháng được truyền vào
    const date = new Date(year, month, 1);

    // Lấy ngày đầu tiên của tháng
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    startDate.setHours(startDate.getHours() - 7);

    // Lấy ngày cuối cùng của tháng
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 17, 59, 59);

    return {
        startDate,
        endDate
    };
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

    // Tạo ngày cuối cùng của quý với thời gian là 16:59:59
    const endDate = new Date(endYear, adjustedEndMonth, new Date(endYear, adjustedEndMonth + 1, 0).getDate(), 17, 59, 59);

    return {
        startDate,
        endDate
    };
}

const options = [
    { text: 'Báo cáo chi phí mua hàng theo từng tháng.', value: 1, },
    { text: 'Báo cáo chi phí mua hàng từ từng nhà cung cấp.', value: 2 },
    { text: 'Tổng doanh thu của công ty trong một khoảng thời gian nhất định.', value: 12 },
    { text: 'Doanh thu sau khi trừ các khoản giảm trừ.', value: 13 },
    { text: 'Lợi nhuận từ hoạt động kinh doanh sau khi trừ giá vốn hàng bán.', value: 14 },
    { text: 'Tỷ lệ lợi nhuận gộp trên doanh thu.', value: 15 },
    { text: 'Lợi nhuận sau khi trừ các chi phí khác và giữ lại.', value: 16 },
    { text: 'Tỷ lệ lợi nhuận gộp được giữ lại so với tổng lợi nhuận.', value: 17 },
    { text: 'ROE (Lợi nhuận sau thuế trên vốn chủ sở hữu).', value: 3 },
    { text: 'ROA (Lợi nhuận trên tổng tài sản).', value: 4 },
    { text: 'ROS (Lợi nhuận trên doanh thu).', value: 5 },
    { text: 'Tỷ lệ nợ đang trong hạn so với tổng nợ.', value: 6 },
    { text: 'Số lần hàng tồn kho được bán hết trong một kỳ.', value: 7 },
    { text: 'Thời gian trung bình để thu hồi các khoản phải thu.', value: 8 },
    { text: 'Thời gian trung bình để thanh toán các khoản phải trả.', value: 9 },
    { text: 'Tỷ lệ tổng nợ trên tổng tài sản của công ty.', value: 10 },
    { text: 'Tỷ lệ thu nhập trước lãi vay và thuế trên lãi vay.', value: 11 },
    { text: 'Báo cáo doanh thu và lợi nhuận theo từng khối hoặc bộ phận kinh doanh.', value: 18 },
    { text: 'Kế hoạch dự kiến doanh thu trong tương lai.', value: 19 },
    { text: 'Báo cáo kết quả kinh doanh hàng tháng cho toàn bộ công ty.', value: 20 },
    { text: 'Báo cáo kết quả kinh doanh hàng tháng cho bộ phận kinh doanh thương mại.', value: 21 },
    { text: 'Báo cáo kết quả kinh doanh hàng tháng cho bộ phận kinh doanh dịch vụ.', value: 22 },
    { text: 'Báo cáo so sánh doanh thu giữa các năm.', value: 23 },
    { text: 'So sánh kế hoạch doanh thu hoặc chỉ số khác của từng tháng giữa các năm.', value: 24 },
    { text: 'Báo cáo kết quả kinh doanh hàng năm cho toàn bộ công ty.', value: 25 },
    { text: 'So sánh lợi nhuận giữa các năm.', value: 26 },
    { text: 'Ngân sách chi phí bán hàng', value: 27 },
    { text: 'Ngân sách chi phí quản lý', value: 28 },
    { text: 'Ngân sách chi phí', value: 29 },
]

const MainChart = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');
    const { searchRead, nameSearch, setLoading, getRevenueByBusinessUnit, getProfitByBusinessUnit, showDialog, showNotification, getbusinessActivityByYear } = useContext(UserContext)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01 00:00:00`).subtract(7, 'hours'))
    const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 17).set('minute', 59).set('second', 59));
    const [dataChart, setDataChart] = useState({})
    const [dataChart2, setDataChart2] = useState({})
    const [planSales, setPlanSales] = useState([])
    const [listBranch, setListBranch] = useState([])
    const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })
    const [business_unit_id, setBusiness_unit_id] = useState(null)
    const [businessUnitList, setBusinessUnitList] = useState(null)

    const [businessActivity, setBusinessActivity] = useState([])
    // dùng biến này để so sánh năm trước đó
    const [businessActivity2, setBusinessActivity2] = useState([])

    const [product, setProduct] = useState(null)
    const [vthh, setVthh] = useState(null)
    const [listProduct, setListProduct] = useState([])
    const [listVthh, setListVthh] = useState([])
    const [price, setPrice] = useState(0)
    const [year1, setYear1] = useState(null)
    const [year2, setYear2] = useState(null)
    const [revenue1, setSevenue1] = useState([])
    const [revenue2, setSevenue2] = useState([])
    const [partner, setPartner] = useState([])
    const [dataExport, setDataExport] = useState([])
    const [typeChart, setTypeChart] = useState(1)
    const [profitPie, setProfitPie] = useState([])
    const [revenuePie, setRevenuePie] = useState([])
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

    const setDate = () => {
        setStartingDate(moment(`${currentYear}-${currentMonth}-01 00:00:00`))
        setEndingDate(moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 17).set('minute', 59).set('second', 59))
        setTime({})
    }

    const handleChange = async (event) => {
        console.log('event', event);
        setDate()
        setLoading(true)
        setTypeChart(event.target.value);
        if (event.target.value === 1) {
            await getValuePurchaseByMonth('', '', 1)
            setLoading(false)
        }
        if (event.target.value === 2) {
            await getValuePurchaseByParner()
            setLoading(false)
        }
        if (event.target.value === 3) {
            await getObjectiveByMonth('', '', 1, 'ROE', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 4) {
            await getObjectiveByMonth('', '', '', 'ROA', 'control_index')
            setLoading(false)
        }
        if (event.target.value === 5) {
            await getObjectiveByMonth('', '', 1, 'ROS', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 6) {
            await getObjectiveByMonth('', '', 1, 'Tổng nợ trong hạn / Tổng nợ', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 7) {
            await getObjectiveByMonth('', '', 1, 'Vòng quay tồn kho', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 8) {
            await getObjectiveByMonth('', '', 1, 'Kỳ thu tiền bình quân', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 9) {
            await getObjectiveByMonth('', '', 1, 'Kỳ trả tiền bình quân', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 10) {
            await getObjectiveByMonth('', '', 1, 'Tổng nợ / Tổng tài sản', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 11) {
            await getObjectiveByMonth('', '', 1, 'EBIT / Lãi vay', 'control_index', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 12) {
            await getObjectiveByMonth('', '', 1, 'Doanh thu', 'revenue', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 13) {
            await getObjectiveByMonth('', '', 1, 'Doanh thu thuần', 'revenue', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 14) {
            await getObjectiveByMonth('', '', 1, 'LNG', 'revenue', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 15) {
            await getObjectiveByMonth('', '', 1, 'LNG / Doanh thu', 'revenue', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 16) {
            await getObjectiveByMonth('', '', 1, 'LNGGL', 'revenue', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 17) {
            await getObjectiveByMonth('', '', 1, 'LNGGL / Doanh thu', 'revenue', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 18) {
            await getDataPie('', '', 1)
            setLoading(false)
        }
        if (event.target.value === 19) {
            await getPlanSales('', '')
            setLoading(false)
        }
        if (event.target.value === 20) {
            await getBusinessMonth('', '', 1)
            setLoading(false)
        }
        if (event.target.value === 21) {
            await getBusinessMonth('', '', 1, 1)
            setLoading(false)
        }
        if (event.target.value === 22) {
            await getBusinessMonth('', '', 1, 2)
            setLoading(false)
        }
        if (event.target.value === 23) {
            setYear1(null)
            setYear2(null)
            await getDataPieYear(2023, 2024, 1)
            setLoading(false)
        }
        if (event.target.value === 24) {
            setYear1(null)
            setYear2(null)
            await getDataRevenueYear(2023, 2024)
            setLoading(false)
        }

        if (event.target.value === 25) {
            setYear1(null)
            setYear2(null)
            await getbusinessActivity(2024, false, 1)
            setLoading(false)

        }

        if (event.target.value === 26) {
            setYear1(null)
            setYear2(null)
            await getbusinessActivityYear(2023, 2024, false, 1)
            setLoading(false)
        }
        if (event.target.value === 27) {
            getExpensesChart('', '', 1, 'selling_expenses', business_unit_id)
            getExpensesChartBar('', '', 1, 'selling_expenses', business_unit_id)
            setLoading(false)
        }
        if (event.target.value === 28) {
            getExpensesChart('', '', 1, 'budget_management', business_unit_id)
            getExpensesChartBar('', '', 1, 'budget_management', business_unit_id)

            setLoading(false)
        }

        if (event.target.value === 29) {
            getExpensesChartBarType('', '', 1, business_unit_id)
            await getExpensesChartType('', '', 1, business_unit_id)
            setLoading(false)
        }

    };


    const handleChangeTime = (event, value) => {
        console.log('value', value);
        setTime(value);
        if (value) {
            const currentYear = new Date().getFullYear();

            if (value.value < 12) {
                // Nếu là tháng
                const { startDate, endDate } = getMonthRange(value.value, currentYear);
                setStartingDate(moment(startDate));
                setEndingDate(moment(endDate));

                console.log('startDate', moment(endDate), (moment(startDate)))
            } else if (value.value >= 12 && value.value <= 15) {
                // Nếu là quý
                const quarter = value.value - 11;
                const { startDate, endDate } = getQuarterRange(quarter, currentYear);
                setStartingDate(moment(startDate));
                setEndingDate(moment(endDate));
            } else {
                // Nếu là năm
                setStartingDate(moment(new Date(currentYear, 0, 1)));
                setEndingDate(moment(new Date(currentYear, 11, 31))
                    .set('hour', 17)
                    .set('minute', 59)
                    .set('second', 59)
                );
            }
        } else {
            setStartingDate(null);
            setEndingDate(null);
        }
    };

    const handlefilter = async (branch, start, end, businessUnit) => {
        setLoading(true)
        if (typeChart === 1) {
            await getValuePurchaseByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, price, product?.text || false, vthh?.text || false)
            setOpen(false)
            setLoading(false)
        }
        if (typeChart === 2) {
            await getValuePurchaseByParner(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), price, product?.value || false, vthh?.text || false, branch)
            setOpen(false)
            setLoading(false)
        }
        if (typeChart === 3) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'ROE', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 4) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'ROA', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 5) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'ROS', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 6) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Tổng nợ trong hạn / Tổng nợ', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 7) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Vòng quay tồn kho', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 8) {
            getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Kỳ thu tiền bình quân', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 9) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Kỳ trả tiền bình quân', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 10) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Tổng nợ / Tổng tài sản', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 11) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'EBIT / Lãi vay', 'control_index', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 12) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Doanh thu', 'revenue', businessUnit)
            setOpen(false)
            setLoading(false)
        }


        if (typeChart === 13) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'Doanh thu thuần', 'revenue', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 14) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'LNG', 'revenue', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 15) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'LNG / Doanh thu', 'revenue', businessUnit)
            setOpen(false)
            setLoading(false)

        } if (typeChart === 16) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'LNGGL', 'revenue', businessUnit)
            setOpen(false)
            setLoading(false)

        } if (typeChart === 17) {
            await getObjectiveByMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 'LNGGL / Doanh thu', 'revenue', businessUnit)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 18) {
            await getDataPie(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch,)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 19) {
            await getPlanSales(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT))
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 20) {
            await getBusinessMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch)
            setOpen(false)
            setLoading(false)
        }

        // Mặc định là KDTT
        if (typeChart === 21) {
            await getBusinessMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 1)
            setOpen(false)
            setLoading(false)
        }

        // Mặc định là KDDA
        if (typeChart === 22) {
            await getBusinessMonth(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), branch, 2)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 23) {
            if (!year1 || !year2) {
                showNotification('', 'Vui lòng chọn thời gian hiển thị dữ liệu', 'error')
                setLoading(false)
                return
            }
            await getDataPieYear(year1, year2, branch)
            setOpen(false)
            setLoading(false)
        }
        if (typeChart === 24) {
            if (!year1 || !year2) {
                showNotification('', 'Vui lòng chọn thời gian hiển thị dữ liệu', 'error')
                setLoading(false)
                return
            }
            await getDataRevenueYear(year1, year2)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 25) {
            if (!year1) {
                showNotification('', 'Vui lòng chọn thời gian hiển thị dữ liệu', 'error')
                setLoading(false)
                return
            }
            await getbusinessActivity(year1, businessUnit, branch)
            setOpen(false)
            setLoading(false)
        }

        if (typeChart === 26) {
            if (!year1) {
                showNotification('', 'Vui lòng chọn thời gian hiển thị dữ liệu', 'error')
                setLoading(false)
                return
            }
            await getbusinessActivityYear(year1, year2, businessUnit, branch)
            setOpen(false)
            setLoading(false)
        }
        if (typeChart === 27) {
            await getExpensesChart(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), 1, 'selling_expenses', businessUnit)
            await getExpensesChartBar(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), 1, 'selling_expenses', businessUnit)
            setOpen(false)
            setLoading(false)
        }
        if (typeChart === 28) {
            await getExpensesChart(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), 1, 'budget_management', businessUnit)
            await getExpensesChartBar(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), 1, 'budget_management', businessUnit)
            setOpen(false)
            setLoading(false)
        }
        if (typeChart === 29) {
            await getExpensesChartBarType(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), 1, businessUnit)
            await getExpensesChartType(moment(start).format(DATE_TIME_FORMAT), moment(end).format(DATE_TIME_FORMAT), 1, businessUnit)
            setLoading(false)
        }

    }

    const getLines = async (name, parent_id) => {
        const result = await searchRead('company.objective.line', ['name', 'plan', 'result'], [['name', '=', name], ['company_objective_id', '=', parent_id]])
        console.log('result', result.result.records[0]);
        return result?.result?.records[0] || {
            id: v4(),
            name,
            plan: 0,
            result: 0
        }
    }

    const getObjectiveByMonth = async (starting_date, ending_date, branch_id, name, type, business_unit_id) => {
        const currentYear = new Date().getFullYear()
        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)],
            ["business_unit_id", "=", business_unit_id || false]];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }

        // if (business_unit_id) {
        //     filters.push();
        // }

        const json = await searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters)

        // lọc các đối tượng theo thời gian bắt đầu để tính tháng
        const mappedData = await Promise.all(json.result.records.map(async (item) => {
            const ending_date = new Date(item.ending_date);
            const month = ending_date.getMonth() + 1; // Month is zero-based, so we add 1
            const line = await getLines(name, item.id);
            return { ...item, month, line, res: line.result, plan: line.plan };
        }));

        console.log('mappedData', mappedData);

        mappedData.sort((a, b) => a.month - b.month);

        const uniqueData = mappedData.map(({ month, res, plan, branch_id }) => ({
            month,
            plan,
            result: res,
            branch_id
        }))

        const month = uniqueData.map(x => `Tháng ${x.month}`)
        const plan = uniqueData.map(x => x.plan / 1000000)
        const result = uniqueData.map(x => x.result / 1000000)
        const totalPlan = plan.reduce((acc, curr) => acc + curr, 0)
        const totalResult = result.reduce((acc, curr) => acc + curr, 0)

        console.log('uniqueData', uniqueData);

        const exp = uniqueData.map((x) => ({
            'Tháng': x.month, 'Công ty': x.branch_id[1], 'Kế hoạch': formatterRevenue.format(x.plan),
            'Thực tế': formatterRevenue.format(x.result),
        }))

        const sortedExp = exp.sort((a, b) => a['Tháng'] - b['Tháng']);
        setDataExport(exp)
        setDataChart({ labels: [...month], plan: [...plan], result: [...result] })
        console.log('setDataChart', setDataChart);
        // console.log('ROE', { labels: [...month, 'Tổng'], plan: [...plan, totalPlan], result: [...result, totalResult] });
        // setDataChart()

    }

    const getLinesExpenses = async (type, parent_id) => {
        const result = await searchRead('company.objective.line', ['name', 'plan', 'result'], [['objective_type', '=', type], ['company_objective_id', '=', parent_id]])
        console.log('result', result.result.records[0]);
        return result?.result?.records || {
            id: v4(),
            name: '',
            plan: 0,
            result: 0
        }
    }


    // Biểu đồ tròn
    const getExpensesChart = async (starting_date, ending_date, branch_id, type, business_unit_id) => {
        const currentYear = new Date().getFullYear()
        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)],
            ["business_unit_id", "=", business_unit_id || false]];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }
        const json = await searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters)
        const mappedData = await Promise.all(json.result.records.map(async (item) => {
            const ending_date = new Date(item.ending_date);
            const month = ending_date.getMonth() + 1; // Month is zero-based, so we add 1
            const line = await getLinesExpenses(type, item.id);
            return { ...item, month, line, res: line.result, plan: line.plan };
        }));

        const expenses = {
            "Tỷ lệ chi phí quảng cáo, marketing": 0,
            "Tỷ lệ chi phí giao nhận chứng từ chuyển phát": 0,
            "Tỷ lệ chi phí vận chuyển giao hàng": 0,
            "Tỷ lệ chi phí xăng xe, tàu xe, thuê phòng công tác, tiếp khách": 0,
            "Tỷ lệ chi ngân hàng": 0,
            "Phí chuyển khoản": 0,
            "LC, Upas, Bảo lãnh": 0
        };

        const budget = {
            "Chi phí lương nhân viên": 0,
            "Chi phí đóng BHXH, BHYT, BHTN": 0,
            "Chi phí khấu hao TSCĐ": 0,
            "Chi phí dịch vụ tư vấn thuê ngoài (bao gồm dịch thuật, luật, Kiểm toán…)": 0,
            "Chi phí điện nước, điện thoại sinh hoạt, viễn thông, website KDTB": 0,
            "Chi phí tiền thuê văn phòng KDTB": 0,
            "Chi phí tuyển dụng, đào tạo KDTB": 0,
            "Chi phí tiền ăn giữa ca KDTB": 0,
            "Chi phí quản lý nhân sự (đồng phục, giày bảo hộ, bảo hiểm tài sản, BH con người…) KDTB": 0,
            "Chi phí quản lý công đoàn KDTB": 0,
            "Chi phí khác quản lý – KDTB": 0,
            "Chi phí tổ chức các sự kiện nội bộ công ty – KDTB": 0,
        };

        const checkType = type === 'selling_expenses' ? expenses : budget

        mappedData.forEach(month => {
            month.line.forEach(item => {
                if (Object.prototype.hasOwnProperty.call(checkType, item.name)) {
                    checkType[item.name] += item.result;
                }
            });
        });

        const dataFinal = Object.entries(checkType).map(([label, value]) => ({ label, value }));
        console.log('dataFinal', dataFinal);
        setProfitPie(dataFinal)
        // return Object.entries(expenses).map(([name, value]) => ({ name, value }));
    }




    const getExpensesChartBar = async (starting_date, ending_date, branch_id, type, business_unit_id) => {
        const currentYear = new Date().getFullYear()
        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)],
            ["business_unit_id", "=", business_unit_id || false]];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }
        const json = await searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters)
        const mappedData = await Promise.all(json.result.records.map(async (item) => {
            const ending_date = new Date(item.ending_date);
            const month = ending_date.getMonth() + 1; // Month is zero-based, so we add 1
            const line = await getLinesExpenses(type, item.id);
            return { ...item, month, line, res: line.result, plan: line.plan };
        }));

        const expenses = [
            "Tỷ lệ chi phí quảng cáo, marketing",
            "Tỷ lệ chi phí giao nhận chứng từ chuyển phát",
            "Tỷ lệ chi phí vận chuyển giao hàng",
            "Tỷ lệ chi phí xăng xe, tàu xe, thuê phòng công tác, tiếp khách",
            "Tỷ lệ chi ngân hàng",
            "Phí chuyển khoản",
            "LC, Upas, Bảo lãnh"
        ];

        const budget = [
            "Chi phí lương nhân viên",
            "Chi phí đóng BHXH, BHYT, BHTN",
            "Chi phí khấu hao TSCĐ",
            "Chi phí dịch vụ tư vấn thuê ngoài (bao gồm dịch thuật, luật, Kiểm toán…)",
            "Chi phí điện nước, điện thoại sinh hoạt, viễn thông, website KDTB",
            "Chi phí tiền thuê văn phòng KDTB",
            "Chi phí tuyển dụng, đào tạo KDTB",
            "Chi phí tiền ăn giữa ca KDTB",
            "Chi phí quản lý nhân sự (đồng phục, giày bảo hộ, bảo hiểm tài sản, BH con người…) KDTB",
            "Chi phí quản lý công đoàn KDTB",
            "Chi phí khác quản lý – KDTB",
            "Chi phí tổ chức các sự kiện nội bộ công ty – KDTB",
        ];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const checkType = type === 'selling_expenses' ? expenses : budget

        const series = checkType.map(expenseType => {
            const monthlyData = months.map(month => {
                const monthData = mappedData.find(item => item.month === months.indexOf(month) + 1);
                if (monthData) {
                    const expense = monthData.line.find(lineItem => lineItem.name === expenseType);
                    return expense ? Number(expense.result.toFixed(2)) : 0;
                }
                return 0;
            });

            return {
                name: expenseType,
                data: monthlyData
            };
        });

        setPlanSales(series)
    }

    // value 29
    const getExpensesChartType = async (starting_date, ending_date, branch_id, type, business_unit_id) => {
        const currentYear = new Date().getFullYear()
        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)],
            ["business_unit_id", "=", business_unit_id || false]];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }
        const json = await searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters)
        const mappedData = await Promise.all(json.result.records.map(async (item) => {
            const ending_date = new Date(item.ending_date);
            const month = ending_date.getMonth() + 1; // Month is zero-based, so we add 1
            const selling = await getLinesExpenses('selling_expenses', item.id);
            const budget = await getLinesExpenses('budget_management', item.id);

            return { month, selling, budget };
        }));

        let sellingTotal = 0;
        let budgetTotal = 0;

        mappedData.forEach(monthData => {
            // Tính tổng cho selling
            sellingTotal += monthData.selling.reduce((sum, item) => {
                return sum + (typeof item.result === 'number' ? item.result : 0);
            }, 0);

            // Tính tổng cho budget
            budgetTotal += monthData.budget.reduce((sum, item) => {
                return sum + (typeof item.result === 'number' ? item.result : 0);
            }, 0);
        });
        // Làm tròn đến 4 chữ số thập phân
        sellingTotal = parseFloat(sellingTotal.toFixed(4));
        budgetTotal = parseFloat(budgetTotal.toFixed(4));

        const result = [
            {
                label: "selling",
                value: sellingTotal
            },
            {
                label: "budget",
                value: budgetTotal
            }
        ];
        setProfitPie(result)
        // return Object.entries(expenses).map(([name, value]) => ({ name, value }));
    }


    // value 29
    const getExpensesChartBarType = async (starting_date, ending_date, branch_id, business_unit_id) => {
        const currentYear = new Date().getFullYear()
        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)],
            ["business_unit_id", "=", business_unit_id || false]];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }
        const json = await searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters)
        const mappedData = await Promise.all(json.result.records.map(async (item) => {
            const ending_date = new Date(item.ending_date);
            const month = ending_date.getMonth() + 1; // Month is zero-based, so we add 1
            const selling = await getLinesExpenses('selling_expenses', item.id);
            const budget = await getLinesExpenses('budget_management', item.id);

            return { month, selling, budget };
        }));
        const sellingData = new Array(12).fill(0);
        const budgetData = new Array(12).fill(0);

        mappedData.forEach((monthData) => {
            const monthIndex = monthData.month - 1;

            // Tính tổng cho selling
            const sellingSum = monthData.selling.reduce((sum, item) => {
                return sum + (typeof item.result === 'number' ? item.result : 0);
            }, 0);
            sellingData[monthIndex] = parseFloat(sellingSum.toFixed(2));

            // Tính tổng cho budget
            const budgetSum = monthData.budget.reduce((sum, item) => {
                return sum + (typeof item.result === 'number' ? item.result : 0);
            }, 0);
            budgetData[monthIndex] = parseFloat(budgetSum.toFixed(2));
        });
        const result = [
            { name: 'selling', data: sellingData },
            { name: 'budget', data: budgetData }
        ];

        setPlanSales(result)
    }


    const getBusinessMonth = async (starting_date, ending_date, branch_id, business_unit_id) => {
        const currentYear = new Date().getFullYear()

        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)],
            ["business_unit_id", "=", business_unit_id || false]];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }

        const json = await searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters)

        // lọc các đối tượng theo thời gian bắt đầu để tính tháng
        const mappedData = await Promise.all(json.result.records.map(async (item) => {
            const ending_date = new Date(item.ending_date);
            const month = ending_date.getMonth() + 1; // Month is zero-based, so we add 1
            const line = await getLines('Doanh thu', item.id);
            return { ...item, month, line, res: line.result, plan: line.plan };
        }));

        console.log('mappedData', mappedData);


        // sử dụng chung nếu phát sinh lỗi thì bắt điều kiện tại đây 
        const aggregated = mappedData.reduce((acc, curr) => {
            const monthKey = curr.month;
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    name: `Mục tiêu công ty tháng ${curr.month}`,
                    starting_date: curr.starting_date,
                    ending_date: curr.ending_date,
                    branch_id: curr.branch_id,
                    month: curr.month,
                    total_plan: 0,
                    total_result: 0
                };
            }
            acc[monthKey].total_plan += (curr.line?.plan || 0);
            acc[monthKey].total_result += (curr.line?.result || 0);
            return acc;
        }, {});

        // Chuyển đổi object thành mảng
        const aggregatedArray = Object.values(aggregated);

        console.log('aggregated', aggregatedArray);
        // -------------đặt trong điều kiện-------------- //


        // Sắp xếp mảng theo tháng
        aggregatedArray.sort((a, b) => a.month - b.month);

        const uniqueData = aggregatedArray.map(({ month, total_result, total_plan, branch_id }) => ({
            month,
            total_plan,
            result: total_result,
            branch_id
        }))

        const month = uniqueData.map(x => `Tháng ${x.month}`)
        const plan = uniqueData.map(x => x.total_plan / 1000000)
        const result = uniqueData.map(x => x.result / 1000000)
        // Tính tarAChi cho từng tháng
        const tarAChi = uniqueData.map(x =>
            x.total_plan !== 0 ? (x.result / x.total_plan) * 100 : 0
        );

        console.log('uniqueData', uniqueData);

        const exp = uniqueData.map((x, index) => ({
            'Tháng': x.month, 'Công ty': x.branch_id[1], 'Kế hoạch': formatterRevenue.format(x.plan),
            'Thực tế': formatterRevenue.format(x.result), 'tarAChi': `${tarAChi[index].toFixed(2)}%`
        }))

        const sortedExp = exp.sort((a, b) => a['Tháng'] - b['Tháng']);
        setDataExport(exp)
        setDataChart({ labels: [...month], plan: [...plan], result: [...result], tarAChi })
        console.log('setDataChart', setDataChart);
        // console.log('ROE', { labels: [...month, 'Tổng'], plan: [...plan, totalPlan], result: [...result, totalResult] });
        // setDataChart()

    }

    const getDataPie = async (starting_date, ending_date, branch_id) => {
        const [revenue, profit] = await Promise.all([
            getRevenueByBusinessUnit(branch_id, starting_date, ending_date),
            getProfitByBusinessUnit(branch_id, starting_date, ending_date)])

        const resultRevenue = revenue.result.map((r) => ({ label: r.name, value: r.value }))
        const resultProfit = profit.result.map((p) => ({ label: p.name, value: p.value }))

        setRevenuePie(resultRevenue)
        setProfitPie(resultProfit)
    }

    const getbusinessActivity = async (year, business_unit_id, branch_id) => {
        const json = await getbusinessActivityByYear(year, business_unit_id, branch_id)
        setBusinessActivity(json.result)
    }

    const getbusinessActivityYear = async (year1, year2, business_unit_id, branch_id) => {
        const [data1, data2] = await Promise.all([
            getbusinessActivityByYear(year1, business_unit_id, branch_id),
            getbusinessActivityByYear(year2, business_unit_id, branch_id)

        ])
        setBusinessActivity(data1.result)
        setBusinessActivity2(data2.result)

    }

    const getDataPieYear = async (year1, year2, branch_id) => {
        const [data1, data2] = await Promise.all([
            getRevenueByBusinessUnit(branch_id, moment(`${year1}-01-01 00:00:00`).format(DATE_TIME_FORMAT), moment(`${year1}-12-31 23:59:59`).format(DATE_TIME_FORMAT)),
            getRevenueByBusinessUnit(branch_id, moment(`${year2}-01-01 00:00:00`).format(DATE_TIME_FORMAT), moment(`${year2}-12-31 23:59:59`).format(DATE_TIME_FORMAT))
        ])

        const resultData1 = data1.result.filter((x) => x.name === 'KDTT' || x.name === 'KDDA').map((r) => ({ label: r.name, value: r.value }))
        const resultData2 = data2.result.filter((x) => x.name === 'KDTT' || x.name === 'KDDA').map((p) => ({ label: p.name, value: p.value }))

        setRevenuePie(resultData1)
        setProfitPie(resultData2)
        console.log('data pie ', resultData1, resultData2);
    }

    const getDataRevenueYear = async (year1, year2, branch_id) => {
        const [data1, data2] = await Promise.all([
            getPlanSales(moment(`${year1}-01-01 00:00:00`).format(DATE_TIME_FORMAT), moment(`${year1}-12-31 23:59:59`).format(DATE_TIME_FORMAT)),
            getPlanSales(moment(`${year2}-01-01 00:00:00`).format(DATE_TIME_FORMAT), moment(`${year2}-12-31 23:59:59`).format(DATE_TIME_FORMAT))
        ])
        setSevenue1(data1)
        setSevenue2(data2)
        console.log('data revenue year ', data1, data2);
    }

    const getPlanSales = async (starting_date, ending_date) => {
        const idArray = businessUnitList
            .filter(item => item.value === 1 || item.value === 2)
            .map(item => item.value)
        const baseFilters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01 17:59:59`).endOf('month').format(DATE_TIME_FORMAT)]
        ];



        const apiCalls = idArray.map(id => {
            const filters = [
                ...baseFilters,
                ['business_unit_id', '=', id]
            ];
            return searchRead('company.objective', ["name", "starting_date", "ending_date", "line_ids", "branch_id", "business_unit_id"], filters);
        });


        try {
            const results = await Promise.all(apiCalls);
            console.log(results);

            const flattenRecords = results.flatMap(response => response.result.records)
                .filter(record => record !== undefined);

            const mappedData = await Promise.all(flattenRecords.map(async (item) => {
                const ending_date = new Date(item.ending_date);
                const month = ending_date.getMonth() + 1;
                const line = await getLines('Doanh Thu', item.id);
                return { ...item, month, line, res: line.result, plan: line.plan };
            }));
            console.log('mappedData', mappedData);

            const groupedByMonth = mappedData.reduce((acc, current) => {
                const month = current.month;
                if (!acc[month]) {
                    acc[month] = [];
                }
                const filteredItem = {
                    plan: current.line.plan,
                    business_unit: current.business_unit_id[1],
                    month: current.month
                };
                acc[month].push(filteredItem);
                return acc;
            }, {});




            const result = {};

            Object.entries(groupedByMonth).forEach(([month, items]) => {
                items.forEach(item => {
                    const { business_unit, plan } = item;
                    if (!result[business_unit]) {
                        result[business_unit] = {
                            name: business_unit,
                            data: Array(12).fill(0),
                        };
                    }
                    result[business_unit].data[parseInt(month, 10) - 1] = plan;
                });
            });

            const transformData = Object.values(result);
            console.log('transformData', transformData);
            await setPlanSales(transformData)
            return transformData
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }



    }

    const onTextChangeBranch = async (value = '') => {
        const json = await nameSearch('res.company.modify', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        setListBranch(result)
    }

    const onTextChangeBusinessUnit = async (value = '') => {
        const json = await nameSearch('business.unit', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
        setBusinessUnitList(result)
    }

    const onTextChangeProduct = async (value = '') => {
        const json = await nameSearch('product.product', value)
        const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
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

    const getValuePurchaseByMonth = async (starting_date, ending_date, branch_id, price, product, vthh,) => {
        const currentYear = new Date().getFullYear()

        const filters = [
            ["starting_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`).subtract(7, 'hours').format(DATE_TIME_FORMAT)],
            ["ending_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 17).set('minute', 59).set('second', 59).format(DATE_TIME_FORMAT)],
        ];
        if (branch_id) {
            filters.push(["branch_id", "=", branch_id]);
        }
        if (vthh) {
            filters.push(["product_categ_name", "=", vthh]);
        }
        if (product) {
            filters.push(["product_code", "=", product]);
        }
        if (price) {
            filters.push(["price_total", ">", price]);
        }



        const json = await searchRead('account.purchase.report', ["name", "starting_date", "ending_date", "branch_id", "total_price"], filters)

        // lọc các đối tượng theo thời gian bắt đầu để tính tháng
        const mappedData = json.result.records.map(item => {
            const startingDate = new Date(item.starting_date);
            const month = startingDate.getMonth() + 1; // Month is zero-based, so we add 1
            return {
                ...item,
                month,
            };
        });

        console.log('mappedData', mappedData);


        // Nhóm các đối tượng theo month và tính tổng total_price(nhóm đối tượng theo tháng)
        const groupedData = mappedData.reduce((acc, curr) => {
            const monthIndex = acc.findIndex((item) => item.month === curr.month);
            if (monthIndex === -1) {
                acc.push({
                    month: curr.month,
                    total_price: curr.total_price,
                    branch_id: curr.branch_id
                });
            } else {
                acc[monthIndex].total_price += curr.total_price;
            }
            console.log('monthIndex', acc);
            return acc
        }, []);

        groupedData.sort((a, b) => a.month - b.month);


        // Loại bỏ các đối tượng bị trùng
        const uniqueData = groupedData.map(({ month, total_price, branch_id }) => ({
            month,
            total_price,
            branch_id
        }))


        let sum = 0;

        const month = uniqueData.map(x => `Tháng ${x.month}`)
        const value = uniqueData.map(x => x.total_price / 1000000)
        const total = value.map((num) => {
            sum += num;
            return sum
        });

        const exp = uniqueData.map((x) => ({
            'Tháng': x.month, 'Công ty': x.branch_id[1], 'Tổng': formatterRevenue.format(x.total_price)
        }))

        const sortedExp = exp.sort((a, b) => a['Tháng'] - b['Tháng']);
        console.log('sortedExp', sortedExp);

        setDataExport(exp)

        setDataChart({ labels: month, value, total })
    }

    const getValuePurchaseByParner = async (starting_date, ending_date, price, product, vthh, branch_id) => {
        const currentYear = new Date().getFullYear()
        const filters = [
            ["payment_date", ">=", starting_date || moment(`${currentYear}-${currentMonth}-01 00:00:00`).subtract(7, 'hours').format(DATE_TIME_FORMAT)],
            ["payment_date", "<=", ending_date || moment(`${currentYear}-${currentMonth}-01`).endOf('month').set('hour', 17).set('minute', 59).set('second', 59).format(DATE_TIME_FORMAT)],];
        if (branch_id) {
            filters.push(['branch_id', '=', branch_id]);
        }

        if (vthh) {
            filters.push(["product_categ_name", "=", vthh]);
        }
        if (product) {
            filters.push(["product_code", "=", product]);
        }
        if (price) {
            filters.push(["price_total", ">=", price * 1000000]);
        }
        const json = await searchRead('account.purchase.report.line', ['payment_date', 'voucher_ref', 'invoice_date', 'invoice_ref',
            'product_name', 'product_code', 'partner_name', 'partner_code', 'unit_name', 'qty_purchased', 'product_price', 'price_total',
            'product_categ_name', 'branch_id'], filters)
        const mappedData = json.result.records.map(item => ({ label: item.partner_name, value: item.price_total / 1000000, partner_code: item.partner_code, branch_id: item.branch_id[1] }));
        const result = Object.values(mappedData.reduce((acc, curr) => {
            if (!acc[curr.label]) {
                acc[curr.label] = { label: curr.label, value: 0, partner_code: curr.partner_code, branch_id: curr.branch_id };
            }
            acc[curr.label].value += curr.value;
            return acc;
        }, {}));

        const top15Result = result
            .sort((a, b) => b.value - a.value)
            .slice(0, 15);

        const exp = result.map((x) => ({ 'Tên nhà cung cấp': x.label, 'Mã nhà cung cấp': x.partner_code, 'Công ty': x.branch_id, 'Tổng': formatterRevenue.format(x.value * 1000000) }))
        setDataExport(exp)
        setPartner(top15Result)


    }

    const filterPrice = (value) => {
        if (value === '') {
            getValuePurchaseByParner()
            return
        }
        const filterResults = partner.filter(x => x.value > value)
        // console.log('filterResults', filterResults);
        // console.log('partner', partner);

        // const exp = mappedData.map((x) => ({
        //     'Tháng': x.month, 'Tên': x.name,
        //     'Ngày bắt đầu': moment(x.starting_date).format(DATE_FORMAT_TO_DISPLAY), 'Ngày kết thúc': moment(x.ending_date).format(DATE_FORMAT_TO_DISPLAY),
        //     'Công ty': x.branch_id[1], 'Tổng': formatterRevenue.format(x.total_price)
        // }))
        // setDataExport(exp)

        setPartner(filterResults)
    }

    const handleInputChange = (event, newInputValue) => {
        console.log('handleInputChange called with:', newInputValue);
        if (newInputValue === '') {
            console.log('Input is empty');
            showDialog('Thông báo', 'Vui lòng chọn thời gian để xem kết quả')
        }
    };

    const businessActivityMemo = useMemo(() => {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const resultObj = {};

        businessActivity.forEach((month, monthIndex) => {
            month.value.forEach(item => {
                if (!resultObj[item.code]) {
                    resultObj[item.code] = {
                        code: item.code,
                        id: v4(),
                        name: item.name,
                        ...Object.fromEntries(monthNames.map(month => [month, '0'])),
                        total: 0 // Thêm trường total
                    };
                }
                const value = parseFloat(item.value) || 0;
                resultObj[item.code][monthNames[monthIndex]] = value.toString();
                resultObj[item.code].total += value; // Cộng dồn vào total
            });
        });

        // Chuyển đổi total thành chuỗi và làm tròn đến 2 chữ số thập phân
        Object.values(resultObj).forEach(item => {
            item.total = item.total.toFixed(2);
        });

        // Sắp xếp mảng kết quả theo mã
        const sortedResult = Object.values(resultObj).sort((a, b) => {
            return parseInt(a.code, 10) - parseInt(b.code, 10);
        });

        const revenueObj = sortedResult.find(item => item.code === '01') || { ...Object.fromEntries(monthNames.map(month => [month, '0'])), total: '0' };
        const businessObj = sortedResult.find(item => item.code === '60') || { ...Object.fromEntries(monthNames.map(month => [month, '0'])), total: '0' };
        const dataLabel = monthNames.map(month => month.toUpperCase());
        const revenue = monthNames.map(month => parseFloat(revenueObj[month]));
        const business = monthNames.map(month => parseFloat(businessObj[month]));
        const tarAChi = monthNames.map(month => {
            const planValue = parseFloat(revenueObj[month]) || 0;
            const resultValue = parseFloat(businessObj[month]) || 0;
            return planValue !== 0 ? (((resultValue / planValue) * 100).toFixed(2)) : 0;
        });
        setDataChart({ labels: [...dataLabel], plan: [...revenue], result: [...business], tarAChi });

        return sortedResult;
    }, [businessActivity]);


    const businessActivity2Memo = useMemo(() => {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const resultObj = {};

        businessActivity2.forEach((month, monthIndex) => {
            month.value.forEach(item => {
                if (!resultObj[item.code]) {
                    resultObj[item.code] = {
                        code: item.code,
                        id: v4(),
                        name: item.name,
                        ...Object.fromEntries(monthNames.map(month => [month, '0'])),
                        total: 0 // Thêm trường total
                    };
                }
                const value = parseFloat(item.value) || 0;
                resultObj[item.code][monthNames[monthIndex]] = value.toString();
                resultObj[item.code].total += value; // Cộng dồn vào total
            });
        });

        // Chuyển đổi total thành chuỗi và làm tròn đến 2 chữ số thập phân
        Object.values(resultObj).forEach(item => {
            item.total = item.total.toFixed(2);
        });

        // Sắp xếp mảng kết quả theo mã
        const sortedResult = Object.values(resultObj).sort((a, b) => {
            return parseInt(a.code, 10) - parseInt(b.code, 10);
        });

        const revenueObj = sortedResult.find(item => item.code === '01') || { ...Object.fromEntries(monthNames.map(month => [month, '0'])), total: '0' };
        const businessObj = sortedResult.find(item => item.code === '60') || { ...Object.fromEntries(monthNames.map(month => [month, '0'])), total: '0' };
        const dataLabel = monthNames.map(month => month.toUpperCase());
        const revenue = monthNames.map(month => parseFloat(revenueObj[month]));
        const business = monthNames.map(month => parseFloat(businessObj[month]));
        const tarAChi = monthNames.map(month => {
            const planValue = parseFloat(revenueObj[month]) || 0;
            const resultValue = parseFloat(businessObj[month]) || 0;
            return planValue !== 0 ? (((resultValue / planValue) * 100).toFixed(2)) : 0;
        });
        setDataChart2({ labels: [...dataLabel], plan: [...revenue], result: [...business], tarAChi });

        return sortedResult;
    }, [businessActivity2]);

    console.log('businessActivity2Memo', businessActivity2Memo);


    const changeDataByPathMemo = useMemo(() => {
        const path = window.location.pathname;
        if (path.includes('chart-business')) {
            return options.filter(option => [12, 13, 14, 15, 16, 17].includes(option.value));
        }
        if (path.includes('chart-expenses')) {
            return options.filter(option => [29].includes(option.value));
        }
        if (path.includes('chart-selling-expenses')) {
            return options.filter(option => [27].includes(option.value));
        }
        if (path.includes('chart-management-expenses')) {
            return options.filter(option => [28].includes(option.value));
        }
        if (path.includes('chart-control-index')) {
            return options.filter(option => [3, 4, 5, 7, 8, 9, 10, 11].includes(option.value));
        }
        if (path.includes('chart-selling')) {
            return options.filter(option => [1, 2].includes(option.value));
        }
        return options;
    }, [window.location.pathname]);



    const init = () => {
        onTextChangeBranch();
        onTextChangeBusinessUnit();
        getValuePurchaseByMonth();
        // getValuePurchaseByParner()
        onTextChangeProduct()
        onTextChangeGroup()
    }

    // const inputArray = [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30];
    // const resultArray = calculateSumArray(inputArray);
    // console.log(resultArray); // Output: [23, 34, 56, 83, 96, 118, 155, 176, 220, 242, 272]

    useEffect(() => { init() }, [])

    useEffect(() => {
        if (window.location.pathname === '/chart-selling') {
            const code = { target: { value: 1 } }
            handleChange(code)
        }
        if (window.location.pathname === '/chart-control-index') {
            const code = { target: { value: 3 } }
            handleChange(code)
        }
        if (window.location.pathname === '/chart-business') {
            const code = { target: { value: 12 } }
            handleChange(code)
        }
        if (window.location.pathname === '/chart-selling-expenses') {
            const code = { target: { value: 27 } }
            handleChange(code)
        }
        if (window.location.pathname === '/chart-management-expenses') {
            const code = { target: { value: 28 } }
            handleChange(code)
        }
        if (window.location.pathname === '/chart-expenses') {
            const code = { target: { value: 29 } }
            handleChange(code)
        }

    }, [window.location.pathname])


    return (
        <>
            <Helmet>
                <title> Sổ chi tiết mua hàng </title>
            </Helmet>
            <Box sx={{
                display: 'flex', flexDirection: 'column', gap: '24px', transform: 'translateZ(0px)', flexGrow: 1, backgroundColor: 'white',
                width: '100%'
            }}>

                <Box

                    sx={{
                        maxHeight: isMobile ? '100vh' : 'calc(100vh - 130px)', overflow: isMobile ? 'unset' : 'auto',
                        padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column',
                    }}>

                    <Grid container spacing={1} >
                        <Grid item xs={12} md={12} sm={12} lg={12}>
                            <Stack width='100%' direction='row' gap='16px' alignItems='center'>
                                <FormControl fullWidth
                                    sx={{ padding: '16px 0', }}>
                                    <Select
                                        size='small'
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={typeChart}
                                        onChange={handleChange}
                                        displayEmpty
                                        sx={{ backgroundColor: '#EBEFFF' }}
                                    >
                                        {/* <MenuItem value="">
                                <em>None</em>
                            </MenuItem> */}
                                        {changeDataByPathMemo.map((x) => (
                                            <MenuItem key={x.value} value={x.value}>{x.text}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button size='small' onClick={() => { setOpen(true) }} sx={{ width: '16%', height: '40px', boxShadow: 'none' }} variant='contained'>Lọc dữ liệu</Button>
                            </Stack>
                        </Grid>
                        <Stack direction='row' gap='16px' padding='8px'>
                            {/* <Stack direction='column' gap='4px'>
                                {starting_date ? <Typography>Thời gian bắt đầu:</Typography> : null}
                                {ending_date ? <Typography>Thời gian kết thúc:</Typography> : null}
                                {branch_id ? <Typography>Công ty:</Typography> : null}
                            </Stack>
                            <Stack direction='column' gap='4px'>
                                {starting_date ? <Typography variant='button'> {moment(starting_date).format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography> : null}
                                {ending_date ? <Typography variant='button'> {moment(ending_date).format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography> : null}
                                {branch_id ? <Typography variant='button'> {branch_id.text}</Typography> : null}
                            </Stack> */}
                            {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : (starting_date ? <Chip label={`Bắt đầu ${moment(starting_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null)}
                            {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : (ending_date ? <Chip label={`Kết thúc ${moment(ending_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> : null)}


                            {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : (ending_date ? vthh && <Chip label={`${vthh.text}`} /> : null)}
                            {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : (product && <Chip label={`${product.text}`} />)}
                            {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : (price ? <Chip label={`${price} Triệu đồng`} /> : null)}
                            {branch_id && <Chip label={`${branch_id.text}`} />}
                            {year1 && <Chip label={`${year1}`} />}
                            {year2 && <Chip label={`${year2}`} />}
                            {business_unit_id && <Chip label={`${business_unit_id.text}`} />}
                        </Stack>
                    </Grid>
                    <Divider />
                    <Grid container spacing={3} >
                        <Grow unmountOnExit in={typeChart === 1}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppValuePurchase
                                    listBranch={listBranch}
                                    getValuePurchaseByMonth={getValuePurchaseByMonth}
                                    dataExport={dataExport}
                                    title="GIÁ TRỊ MUA HÀNG (Triệu đồng)"
                                    subheader="(+43%) than last year"
                                    chartLabels={dataChart.labels}
                                    chartData={[
                                        {
                                            name: 'Giá trị mua hàng',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.value,
                                        },
                                        {
                                            name: 'Tổng giá trị mua hàng',
                                            type: 'area',
                                            fill: 'gradient',
                                            data: dataChart.total,
                                        },

                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 2}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppValueParner
                                    title="GIÁ TRỊ MUA HÀNG THEO NHÀ CUNG CẤP (Triệu đồng)"
                                    getValuePurchaseByParner={getValuePurchaseByParner}
                                    dataExport={dataExport}
                                    chartData={partner}
                                    listProduct={listProduct}
                                    listBranch={listBranch}
                                    filterPrice={filterPrice}
                                />

                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 3}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='ROE'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Lợi Nhuận Sau Thuế Trên Vốn Chủ Sở Hữu"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 4}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='ROA'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Lợi Nhuận Trên Tổng Tài Sản."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },

                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 5}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='ROS'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Lợi Nhuận Trên Doanh Thu."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },

                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 6}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    businessUnit={business_unit_id}
                                    type='Tổng nợ trong hạn / Tổng nợ'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Tổng nợ trong hạn / Tổng nợ (Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },

                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 7}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='Vòng quay tồn kho'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Số Lần Hàng Tồn Kho Được Bán Hết Trong Một Kỳ."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 8}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='Kỳ thu tiền bình quân '
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Thời Gian Trung Bình Để Thu Hồi Các Khoản Phải Thu."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 9}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='Kỳ trả tiền bình quân'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Thời Gian Trung Bình Để Thanh Toán Các Khoản Phải Trả."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 10}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='Tổng nợ / Tổng tài sản'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Tỷ Lệ Tổng Nợ Trên Tổng Tài Sản Của Công Ty."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[
                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 11}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='EBIT / Lãi vay'
                                    objective_type='control_index'
                                    dataExport={dataExport}
                                    title="Tỷ Lệ Thu Nhập Trước Lãi Vay Và Thuế Trên Lãi Vay."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 12}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='Doanh thu'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Tổng Doanh Thu Của Công Ty Trong Một Khoảng Thời Gian Nhất Định."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 13}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='Doanh thu thuần'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Doanh Thu Sau Khi Trừ Các Khoản Giảm Trừ."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 14}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='LNG'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Lợi Nhuận Từ Hoạt Động Kinh Doanh Sau Khi Trừ Giá Vốn Hàng Bán."
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 15}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='LNG / Doanh thu'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Lợi nhuận gộp / Doanh thu(Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 16}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='LNGGL'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Lợi nhuận gộp giữ lại(Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[

                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 17}>
                            <Grid item xs={12} md={12} lg={12}>
                                <ObjectiveChart
                                    listBranch={listBranch}
                                    getValue={getObjectiveByMonth}
                                    type='LNGGL / Doanh thu'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Tỷ lệ lợi nhuận gộp giữ lại / Doanh thu (Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[
                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },

                                    ]}
                                />
                            </Grid>
                        </Grow>

                        {typeChart === 18 ? <>
                            <Grid item xs={12} md={6} lg={6}>
                                <AppCurrentVisits
                                    title="Doanh Thu"
                                    chartData={revenuePie}
                                    chartColors={[
                                        '#FF5733',
                                        '#33FF57',
                                        '#3357FF',
                                        '#FF33A6',
                                        '#FFD733',
                                        '#33FFD7',
                                        '#FF33FF',
                                        '#FFA833',
                                        '#909eab',
                                    ]}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} lg={6}>
                                <AppCurrentVisits
                                    title="Lợi Nhuận"
                                    chartData={profitPie}
                                    chartColors={[
                                        '#FF5733',
                                        '#33FF57',
                                        '#3357FF',
                                        '#FF33A6',
                                        '#FFD733',
                                        '#33FFD7',
                                        '#FF33FF',
                                        '#FFA833',
                                        '#909eab',
                                    ]}
                                />

                            </Grid>
                        </> : null}

                        <Grow unmountOnExit in={typeChart === 19}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppPlanSales showTitle data={planSales} />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 20}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppTotalBusiness
                                    listBranch={listBranch}
                                    type='Kết quả kinh doanh theo tháng'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Doanh thu (Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[
                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                        {
                                            name: 'TarAChi',
                                            type: 'line',
                                            fill: 'solid',
                                            data: dataChart?.tarAChi?.map(value => value) || [],
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 21}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppTotalBusiness
                                    listBranch={listBranch}
                                    type='Kết quả kinh doanh KDTT theo tháng'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Doanh thu (Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[
                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                        {
                                            name: 'TarAChi',
                                            type: 'line',
                                            fill: 'solid',
                                            data: dataChart?.tarAChi?.map(value => value) || [],
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>

                        <Grow unmountOnExit in={typeChart === 22}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppTotalBusiness
                                    listBranch={listBranch}
                                    type='Kết quả kinh doanh KDDA theo tháng'
                                    objective_type='revenue'
                                    dataExport={dataExport}
                                    title="Doanh thu (Triệu đồng)"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    chartData={[
                                        {
                                            name: 'Kế hoạch',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Thực tế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                        {
                                            name: 'TarAChi',
                                            type: 'line',
                                            fill: 'solid',
                                            data: dataChart?.tarAChi?.map(value => value) || [],
                                        },
                                    ]}
                                />
                            </Grid>
                        </Grow>


                        {typeChart === 23 ? <>
                            <Grid item xs={12} md={6} lg={6}>
                                <AppCurrentVisits
                                    showTotal={year1 || 2023}
                                    title={`Doanh thu ${year1 || 2023}`}
                                    chartData={revenuePie}
                                    chartColors={[
                                        '#2196F3', '#4CAF50',
                                    ]}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} lg={6}>
                                <AppCurrentVisits
                                    showTotal={year2 || 2024}
                                    title={`Doanh thu ${year2 || 2024}`}
                                    chartData={profitPie}
                                    chartColors={[
                                        '#2196F3', '#4CAF50',
                                    ]}
                                />

                            </Grid>
                        </> : null}

                        {typeChart === 24 ? <>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppPlanSales
                                    showTitle
                                    year={year1 || 2023}
                                    data={revenue1} />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppPlanSales
                                    showTitle
                                    year={year2 || 2024}
                                    data={revenue2} />
                            </Grid>
                        </> : null}

                        <Grow unmountOnExit in={typeChart === 25}>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppBusinessOfYear title="Báo cáo kết quả kinh doanh"
                                    subheader=""
                                    chartLabels={dataChart.labels}
                                    dataTable={businessActivityMemo}
                                    chartData={[

                                        {
                                            name: 'Doanh Thu',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.plan,
                                        },
                                        {
                                            name: 'Sau Thuế',
                                            type: 'column',
                                            fill: 'solid',
                                            data: dataChart.result,
                                        },
                                    ]} />
                            </Grid>
                        </Grow>

                        {typeChart === 27 ? <>
                            <Grid item xs={12} md={6} lg={6}>
                                <AppPlanSales customTitle='Chi Phí Bán Hàng' data={planSales} />
                            </Grid>
                            <Grid item xs={12} md={6} lg={6}>
                                <AppCurrentVisits
                                    title="Chi phí bán hàng"
                                    chartData={profitPie}
                                    chartColors={[
                                        '#1E88E5',
                                        '#43A047',
                                        '#5E35B1',
                                        '#E53935',
                                        '#FDD835',
                                        '#00ACC1',
                                        '#8E24AA',
                                        '#FB8C00',
                                        '#607D8B',
                                    ]}
                                />
                            </Grid>
                        </> : null}

                        {typeChart === 28 ? <>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppPlanSales customTitle='Chi Phí Quản Lý' data={planSales} />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppCurrentVisits
                                    title="Chi phí bán hàng"
                                    chartData={profitPie}
                                    chartColors={[
                                        '#1E88E5',
                                        '#43A047',
                                        '#5E35B1',
                                        '#E53935',
                                        '#FDD835',
                                        '#00ACC1',
                                        '#8E24AA',
                                        '#FB8C00',
                                        '#607D8B',
                                    ]}
                                />
                            </Grid>
                        </> : null}

                        {typeChart === 29 ? <>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppPlanSales customTitle='Chi Phí' data={planSales} />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <AppCurrentVisits
                                    title="Chi phí"
                                    chartData={profitPie}
                                    chartColors={[
                                        '#1E88E5',
                                        '#43A047',
                                        '#5E35B1',
                                        '#E53935',
                                        '#FDD835',
                                        '#00ACC1',
                                        '#8E24AA',
                                        '#FB8C00',
                                        '#607D8B',
                                    ]}
                                />
                            </Grid>
                        </> : null}
                    </Grid>
                </Box>
            </Box >

            <Drawer
                className='bg-drawer'
                anchor={'right'}
                open={open}
                onClose={() => setOpen(false)}
            >
                <Stack direction='column' width='520px' padding='16px' alignItems='flex-start' gap='16px'>
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
                                    onInputChange={(event, value) => {
                                        if (value === '') {
                                            setBranch_id(null)
                                        }
                                        // setBranch_id(value)
                                        // onTextChangeGroup(value)
                                    }}

                                    sx={{ width: '100%' }}
                                    renderInput={(params) => (
                                        <TextField placeholder='Chọn công ty'
                                            variant={'outlined'}
                                            {...params} />
                                    )} />
                            </Stack>
                        </Grid>
                        {typeChart === 2 || typeChart === 23 || typeChart === 21 || typeChart === 22 ? null : <>
                            <Grid item xs={12} md={8} sm={8} lg={8}>
                                <Stack direction='column'>
                                    <Typography variant='caption'>Khối</Typography>
                                    <Autocomplete
                                        className='custom-autocomplete'
                                        disablePortal
                                        id="combo-box-demo"
                                        value={business_unit_id?.text || ''}
                                        // inputValue={this.state.managerSearch}
                                        onChange={(event, businessId) => {
                                            setBusiness_unit_id(businessId)
                                        }}
                                        options={businessUnitList}
                                        onInputChange={(event, value) => {
                                            if (value === '') {
                                                setBusiness_unit_id(null)
                                            }
                                            // setBranch_id(value)
                                            // onTextChangeGroup(value)
                                        }}

                                        sx={{ width: '100%' }}
                                        renderInput={(params) => (
                                            <TextField placeholder='Chọn khối'
                                                variant={'outlined'}
                                                {...params} />
                                        )} />
                                </Stack>
                            </Grid>
                        </>}

                        <Grid xs={12} md={4} sm={4} lg={4} />
                        {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : <Grid item xs={12} md={8} sm={8} lg={8}>
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
                        </Grid>}


                        {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? null : <Grid sx={{ alignItems: 'center', display: 'flex', gap: '4px' }} item xs={12} md={12} sm={12} lg={12}>
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
                        </Grid>}

                        {typeChart !== 2 ? null :
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
                                                    setVthh(null)
                                                }
                                                // setVthh(value)
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
                                                    setProduct(null)
                                                }
                                                // onTextChangeProduct(value)

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

                        {typeChart === 23 || typeChart === 24 || typeChart === 25 || typeChart === 26 ? <Grid sx={{ alignItems: 'center', display: 'flex', gap: '4px' }} item xs={12} md={12} sm={12} lg={12}>
                            <Stack direction='column'>
                                <Typography variant='caption'>Nhập năm</Typography>
                                <TextField
                                    size='small'
                                    className='custom-textfiled'
                                    sx={{ width: '100%' }}
                                    variant='outlined'
                                    name="name"
                                    placeholder='Năm...'
                                    defaultValue={year1 || ''}
                                    onChange={({ target: { value } }) => {
                                        setYear1(value)
                                        // filterPrice(value)
                                    }}
                                    required
                                />
                            </Stack>
                            {typeChart === 25 ? null : <>
                                <Typography variant='caption'>Và</Typography>
                                <Stack direction='column'>
                                    <Typography variant='caption'>Nhập năm</Typography>
                                    <TextField
                                        size='small'
                                        className='custom-textfiled'
                                        sx={{ width: '100%' }}
                                        variant='outlined'
                                        name="name"
                                        placeholder='Năm...'
                                        defaultValue={year2 || ''}
                                        onChange={({ target: { value } }) => {
                                            setYear2(value)
                                            // filterPrice(value)
                                        }}
                                        required
                                    />
                                </Stack>
                            </>}

                        </Grid> : null}


                    </Grid>
                    <Stack direction='row-reverse' width='100%'>
                        <Button onClick={() => { handlefilter(branch_id?.value || false, starting_date, ending_date, business_unit_id?.value || false) }} variant='contained' color='success' sx={{ boxShadow: 'none' }}>Xác nhận</Button>
                    </Stack>
                </Stack>
            </Drawer>
        </>
    );
}

export default MainChart
