import { Autocomplete, Box, Grid, Pagination, Stack, TextField, Typography, alpha, styled, useMediaQuery } from '@mui/material'
import { DataGrid, GridToolbarContainer, gridClasses } from '@mui/x-data-grid';
import { viVN } from '@mui/x-data-grid/locales';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { createSearchParams, useNavigate } from 'react-router-dom';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, routes } from 'src/global';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar'


const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: '#EBEFFF',
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

const AccountModify = () => {
    const { loadViews, setLoading, searchRead, showDialog } = useContext(UserContext)
    const isMobile = useMediaQuery('(max-width:600px)');
    const navigate = useNavigate()
    const [fieldOfView, setFieldOfView] = useState({})
    const [starting_date, setStartingDate] = useState(null)
    const [ending_date, setEndingDate] = useState(null)
    const [accoutingModify, setAccoutingModify] = useState([])
    const [breadcrumb] = useState([{ name: 'GLA', path: routes.accoutingFinacial.path }])

    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

    const fetchLoadViews = async () => {
        // setLoading(true)
        const view = await loadViews('account.account.modify', ['list']);
        if (view.error) {
            setLoading(false)
            showDialog('', view.error.data.message);
            return;
        }
        const result = view.result.fields;
        setFieldOfView(result)
        // setLoading(false)
    }

    const getData = async (starting_date, ending_date, limit, offset) => {
        setLoading(true)
        const filters = [];

        if (starting_date && ending_date) {
            filters.push(["message_last_post", ">=", starting_date],
                ["message_last_post", "<=", ending_date],);
        }
        const [data] = await Promise.all([
            searchRead('account.account.modify', ["name", "code", "type", "total_debit_amount", "total_credit_amount"], filters, { sort: 'id desc', limit, offset })]);
        if (data.error) {
            showDialog('', data.error.data.message);
            setLoading(false)
            return;
        }
        const result = data.result.records;
        setLoading(false)
        setAccoutingModify(result)
    };

    const getDataForEnDate = (date) => {
        if (!starting_date) {
            showDialog('', 'Vui lòng chọn đủ thông tin')
            return
        }
        setEndingDate(date)
        getData(moment(starting_date).format(DATE_TIME_FORMAT), moment(date).format(DATE_TIME_FORMAT), 400, 0)
    }

    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'name',
            headerName: getLabel('Tên'),
            renderCell: (params) =>
                params?.row?.name || '',
            flex: 1
        },
        {
            field: 'code',
            headerName: getLabel('Mã'),
            renderCell: (params) =>
                params?.row?.code || '',
            flex: 1,
            align: 'center',
            headerAlign: 'center',

        },
        {
            field: 'total_debit_amount',
            headerName: getLabel('Total Debit Amount'),
            renderCell: (params) =>
                params?.row?.total_debit_amount || '',
            flex: 1,
            align: 'right',
            headerAlign: 'right',
        }, {
            field: 'total_credit_amount',
            headerName: getLabel('Total Credit Amount'),
            renderCell: (params) =>
                params?.row?.total_credit_amount || '',
            flex: 1,
            align: 'right',
            headerAlign: 'right',

        },
        // {
        //   field: 'delete',
        //   headerName: '',
        //   width: 150,
        //   renderCell: (params) => {
        //     return <DeleteButton id={params.row.id} isEditing={isEditing}
        //       getDetailInfo={getDetailInfo}
        //     />
        //   },
        // }
    ];

    const handleDomainChange = async (domain) => {
        const json = await searchRead('account.account.modify', ["name", "code", "type", "total_debit_amount", "total_credit_amount"], domain)
        if (json.error) {
            showDialog('', json.error.data.message);
            return;
        }
        const result = json.result.records;
        if (JSON.stringify(result) !== JSON.stringify(accoutingModify)) {
            setAccoutingModify(result)
        }
    };



    const dataMemo = useMemo(() => accoutingModify.map((item, index) => ({ id: index, key: item.id, ...item })), [accoutingModify])

    const handleRowClick = (id = '') => {
        navigate({ pathname: routes.DetailaccountModify.path, search: createSearchParams({ id }).toString() });
    };

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <Stack width='100%' direction='row' gap='8px' justifyContent='space-between' alignItems='center'>
                    <Stack direction='column'>
                        <Typography variant='h6' textTransform='uppercase'>Danh sách tài khoản</Typography>
                        {/* <GridToolbarFilterButton sx={{ p: 0, justifyContent: 'flex-start !important' }} /> */}
                    </Stack>
                </Stack>
            </GridToolbarContainer >
        );
    }

    useEffect(() => { getData('', '', 400, 0); fetchLoadViews(); }, [])

    return (
        <>
            <Helmet>
                <title> Sổ chi tài khoản kế toán </title>
            </Helmet>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', transform: 'translateZ(0px)', flexGrow: 1 }}>
                <HeaderToolbar
                    breadcrumb={breadcrumb}
                    routeName="Tài khoản"
                    onDomainChange={handleDomainChange}
                    searchFields={[
                        { text: getLabel('tên'), value: 'name' },
                    ]}
                />
                < Box sx={{ maxHeight: isMobile ? '100vh' : 'calc(100vh - 250px)', overflow: isMobile ? 'unset' : 'auto', backgroundColor: 'white', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Box padding='8px' backgroundColor='#F8F8F8' borderRadius='4px'>
                        <Grid container spacing={3}  >
                            <Grid sx={{ alignItems: 'center', display: 'flex', gap: '4px' }} item xs={12} md={4} sm={4} lg={4}>
                                <DateTimePicker
                                    className='custom-template'
                                    size="small"
                                    variant='standard'
                                    format={DATE_FORMAT_TO_DISPLAY}
                                    onChange={(date) => { setStartingDate(date) }}
                                    value={starting_date}
                                />
                                <Typography variant='caption'>Đến</Typography>
                                <DateTimePicker
                                    className='custom-template'
                                    size="small"
                                    format={DATE_FORMAT_TO_DISPLAY}
                                    onChange={(date) => { getDataForEnDate(date) }}
                                    value={ending_date}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box width='100%' >
                        <StripedDataGrid
                            className="custom-dataGrid"
                            rows={dataMemo}
                            columns={columns}
                            autoHeight {...dataMemo}
                            initialState={{
                                ...dataMemo.initialState,
                                pagination: { paginationModel: { pageSize: 40 } },
                            }}
                            localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                            slots={{
                                toolbar: CustomToolbar,
                            }}
                            onRowClick={(row) => {
                                handleRowClick(row.id);
                            }}
                            getRowClassName={(params) =>
                                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                            }
                        />
                    </Box>
                </Box>

            </Box >
        </>
    )
}

export default AccountModify
