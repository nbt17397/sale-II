import React, { Component, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Autocomplete, Box, Chip, FormControl, FormHelperText, Grid, Grow, IconButton, Skeleton, Stack, Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, compareObjects, formatterRevenue, mapFieldToOption, routes } from 'src/global';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar';
import moment from 'moment';
import { DateTimePicker } from '@mui/x-date-pickers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { Container, TabPanel } from 'src/components/tab-panel/Wrapper';
import SwipeableViews from 'react-swipeable-views';
import './BookFinacial.css'
import TabGLA from 'src/components/detail-book-finacial/TabGLA';
import { AppWidgetSummary } from 'src/sections/@dashboard/app';


class DetailAccoutingFinacial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            display_name: '',
            name: '',
            gla_line_ids: [],
            starting_date: null,
            ending_date: null,
            total_closing_credit_amount: 0,
            total_closing_debit_amount: 0,
            total_credit_amount: 0,
            total_debit_amount: 0,
            field_of_view: {},
        }
    }

    componentDidMount() {
        this.init();
    }

    async accountInfo(id = '') {
        // console.log('id', id);
        const { read } = this.props
        const json = await read('account.general.ledger', [id], ["display_name", "name", "gla_line_ids",
            "total_closing_credit_amount", "total_closing_debit_amount", "total_credit_amount", "starting_date", "total_debit_amount", "ending_date"])
        return json
    }

    async init() {
        const { loadViews, params, setLoading, user, searchRead, showDialog,
            showNotification, id } = this.props
        setLoading(true)
        if (id) {
            const [fieldName, accountInfo] = await Promise.all([
                loadViews('account.general.ledger', ['form']),
                this.accountInfo(id),
            ]);
            const label = fieldName.result.fields
            const {
                display_name,
                name,
                gla_line_ids,
                total_closing_credit_amount,
                total_closing_debit_amount,
                total_credit_amount,
                starting_date,
                total_debit_amount,
                ending_date
            } = accountInfo.result[0]
            this.setState({
                display_name,
                name,
                gla_line_ids,
                total_closing_credit_amount: formatterRevenue.format(total_closing_credit_amount),
                total_closing_debit_amount: formatterRevenue.format(total_closing_debit_amount),
                total_credit_amount: formatterRevenue.format(total_credit_amount),
                total_debit_amount: formatterRevenue.format(total_debit_amount),
                field_of_view: label,
                starting_date: moment(starting_date).isValid ? moment(starting_date) : null,
                ending_date: moment(ending_date).isValid ? moment(ending_date) : null,
            })
        } else {
            console.log('Giao diện tạo mới');
        }
        setLoading(false)


    }



    render() {
        const { display_name, name, gla_line_ids, starting_date, ending_date, total_closing_credit_amount
            , total_closing_debit_amount, total_credit_amount, total_debit_amount, field_of_view,
        } = this.state
        const { id, breadcrumb } = this.props
        return (
            <>
                <Helmet>
                    <title>{display_name}</title>
                </Helmet>

                <Stack direction='column' sx={{ maxHeight: 'calc(100vh - 127px)', overflow: 'auto' }}>

                    <Stack direction='column' gap='16px'>
                        <HeaderToolbar breadcrumb={breadcrumb} routeName={display_name} />
                        <Stack direction='column' gap='8px' sx={{
                            boxShadow: '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)',
                            backgroundColor: 'white', borderRadius: '4px', padding: '16px', mb: 3
                        }} >
                            <Typography variant="h4" >
                                {display_name}
                            </Typography>
                            <Stack direction='column' gap='4px'>
                                <Typography variant="body2" >
                                    Ngày bắt đầu:  {moment(starting_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}
                                </Typography>
                                <Typography variant="body2" >
                                    Ngày kết thúc:  {moment(ending_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}
                                </Typography>
                            </Stack>
                            {/* <Chip color="primary" sx={{ maxWidth: '15%' }} label={`Thời gian:  - ${moment(ending_date).format(DATE_FORMAT_TO_DISPLAY)}`} /> */}
                        </Stack>
                    </Stack>

                    <Grid sx={{ mb: 3 }} container spacing={3}>
                        {/* <Grid item xs={12} sm={6} md={6}>
                            <AppWidgetSummary title="Tổng Số Tiền Phát Sinh Nợ" total={total_debit_amount} icon={'game-icons:pay-money'} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <AppWidgetSummary title="Tổng Số Tiền Phát Sinh Có" total={total_credit_amount} icon={'solar:wad-of-money-bold'} />
                        </Grid> */}
                        {/* <Grid item xs={12} sm={6} md={3}>
                            <AppWidgetSummary title="Tổng Số Tiền Ghi Nợ Cuối Kỳ" total={total_closing_debit_amount} icon={'game-icons:take-my-money'} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <AppWidgetSummary title="Tổng Số Tiền Tín Dụng Đóng" total={total_closing_credit_amount} icon={'fluent:receipt-money-20-filled'} />
                        </Grid> */}
                    </Grid>

                    <Box sx={{
                        display: 'flex', flexDirection: 'column', boxShadow: '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)',
                        backgroundColor: 'white', borderRadius: '4px', padding: '16px',

                    }}>
                        <TabGLA
                            id={id}
                            name='Chi tiết GLA'
                            model='account.general.ledger.line'
                            line_ids={gla_line_ids}
                        />
                    </Box>
                </Stack >
            </>
        )
    }
}

export default function (props) {
    const { showDialog, searchRead, loadViews, showNotification, nameSearch, setLoading, read, create, write } = useContext(UserContext)
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const id = parseInt(params.get('id'), 10)
    const user = JSON.parse(localStorage.getItem('userKey'))
    const [breadcrumb] = useState([{ name: 'GLA', path: routes.accoutingFinacial.path }])
    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme()
    const [value, setValue] = React.useState(0);


    const tabSx = {
        borderRight: '2px solid rgba(255,255,255,.1)',
        borderRadius: '2px', minWidth: '90px', fontSize: '13px', padding: '6px 8px', minHeight: '36px',
        fontWeight: 500
    }
    const handleChange = (event, tabIndex) => {
        setValue(tabIndex);
        localStorage.setItem('detailProjectActiveTab', tabIndex);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
        localStorage.setItem('detailProjectActiveTab', index);
    };

    return (
        <DetailAccoutingFinacial {...props} {...{
            params, setParams, breadcrumb, showDialog, searchRead, loadViews, create, theme,
            read, id, user, isMobile, navigate, showNotification, nameSearch, setLoading, write,
            value, tabSx, handleChange, handleChangeIndex
        }} />

    )
}