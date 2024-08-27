import { Backdrop, Box, Button, Fade, Modal, Pagination, Stack, Typography, useMediaQuery } from '@mui/material'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global'
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, gridClasses } from '@mui/x-data-grid'
import { viVN } from '@mui/x-data-grid/locales';


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


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    borderRadius: '12px',
    padding: '24px',
};

const TabHistory = ({ line_ids, id, detailDepen, model, getData, onCreateData }) => {
    console.log('id', id);
    const [params, setParams] = useSearchParams()
    const [fieldOfView, setFieldOfView] = React.useState({})
    const { loadViews, showDialog, searchRead, showNotification, setLoading, loading, read } = useContext(UserContext)
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('userKey'))
    const isMobile = useMediaQuery('(max-width:600px)');
    const [detail, setDetail] = useState([])
    const [open, setOpen] = useState(false) // for setting pop up
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItem, setCurrentItem] = useState({})

    const handleOpen = () => setOpen(true);
    const handleClose = () => { setOpen(false) }


    const getFieldsDetail = async () => {
        const json = await loadViews(model, ['list'])
        const result = json.result.fields;
        setFieldOfView(result)
    }

    const getDetailInfo = async (limit, offset) => {
        setLoading(true)
        const { result, error } = await searchRead(model, ["account_name", "account_code", "type",
            "debit_amount", "credit_amount", "debit_balance_amount", "credit_balance_amount", "created_date",
        ], [["id", "in", line_ids]], { sort: 'id desc', limit, offset });
        if (error) {
            console.log('1111');
            showDialog('', error.data.message);
        } else {
            const json = result.records
            setDetail(json);
            setLoading(false)
        }
    };

    const detailMemo = React.useMemo(() => detail.map((x) => ({ ...x })), [detail]);

    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'account_name',
            headerName: getLabel('Account Name'),
            renderCell: (params) => params.row.account_name,
            headerAlign: 'left',
            flex: 1
        },
        {
            field: 'account_code',
            headerName: getLabel('Account Code'),
            renderCell: (params) => params.row.account_code,
            headerAlign: 'left',
            align: 'left',
            flex: 1


        },
        {
            field: 'type',
            headerName: getLabel('Type'),
            renderCell: (params) => params.row.type,
            headerAlign: 'center',
            align: 'center',
            flex: 1

        },
        {
            field: 'debit_amount',
            headerName: getLabel('Debit Amount'),
            renderCell: (params) => formatterRevenue.format(params?.row?.debit_amount || 0),
            headerAlign: 'center',
            align: 'center',
            flex: 1

        },
        {
            field: 'credit_amount',
            headerName: getLabel('Credit Amount'),
            renderCell: (params) => formatterRevenue.format(params?.row?.credit_amount || 0),
            headerAlign: 'left',
            align: 'left',
            flex: 1

        },
        {
            field: 'debit_balance_amount',
            headerName: getLabel('Debit Balance Amount'),
            renderCell: (params) => formatterRevenue.format(params?.row?.debit_balance_amount || 0),
            headerAlign: 'left',
            align: 'left',
            flex: 1

        },
        {
            field: 'credit_balance_amount',
            headerName: getLabel('Credit Balance Amount'),
            renderCell: (params) => formatterRevenue.format(params?.row?.credit_balance_amount || 0),
            headerAlign: 'left',
            align: 'left',
            flex: 1

        },
        {
            field: 'created_date',
            headerName: getLabel('Created Date'),
            renderCell: (params) => moment(params.row.created_date).add(7,'hours').format(DATE_TIME_FORMAT_TO_DISPLAY),
            headerAlign: 'left',
            align: 'left',
            flex: 1

        },

    ];

    const handlePageChange = (events, page) => {
        setCurrentPage(page);
        if (page < 0 || page >= Math.ceil(page / 40)) {
            console.log('Trang không hợp lệ');
        }
        if (page === 1) {
            getDetailInfo(40, 0)
        } else {
            const startIndex = (page * 40 - 40) + 1;
            getDetailInfo(40, startIndex)
        }


    };


    const handleRowClick = (id = '') => {
        navigate({ pathname: '', search: createSearchParams({ id }).toString() });
    };

    const CustomToolbar = () => {
        const page = line_ids.length
        return (
            <GridToolbarContainer>
                <Stack width='100%' direction='row' gap='8px' justifyContent='space-between' alignItems='center'>
                    <Stack direction='column'>
                        <Typography variant='h6' textTransform='uppercase'>Lịch sử</Typography>
                        <GridToolbarFilterButton sx={{ justifyContent: 'flex-start ' }} />
                    </Stack>
                    <Pagination
                        onChange={handlePageChange}
                        page={currentPage}
                        count={Math.ceil(page / 40)} />
                </Stack>
            </GridToolbarContainer >
        );
    }

    const handelCurrentItem = (value) => {
        handleOpen()
        setCurrentItem(value.row)
    }

    useEffect(() => {
        getFieldsDetail();
        getDetailInfo(40, 0);
    }, [id, line_ids]);

    return (
        <Box maxWidth='calc(100vw - 140px)' overflowX='auto' >
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
                rowHeight={40}
                className="data-grid grid-dashboard"
                rows={detailMemo}
                columns={columns}
                hideFooter
                loading={loading}
                getRowHeight={() => 'auto'}
                autoHeight {...detailMemo}
                localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                initialState={{
                    ...detailMemo.initialState,
                    pagination: { paginationModel: { pageSize: 40 } },
                }}
                onCellClick={(id) => { handelCurrentItem(id) }}
                slots={{
                    toolbar: CustomToolbar,
                }}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                } />
            {open ? <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotprops={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <Stack direction='column' >
                            <Stack justifyContent='flex-start' padding='16px' borderBottom='2px #ccc solid'>
                                <Typography>Chi tiết GLA</Typography>
                            </Stack>
                            <Stack direction='row' gap='32px' padding='8px'>
                                <Stack direction='row' gap='16px'>
                                    <Stack direction='column' gap='8px'>
                                        <Typography color='#ccc' variant='button'>account_name</Typography>
                                        <Typography color='#ccc' variant='button'>account_code</Typography>
                                        <Typography color='#ccc' variant='button'>type</Typography>
                                        <Typography color='#ccc' variant='button'>debit_amount</Typography>
                                    </Stack>
                                    <Stack direction='column' gap='8px'>
                                        <Typography color={currentItem.voucher_type ? 'black' : 'white'} variant='button'>{currentItem?.account_name || 'a'}</Typography>
                                        <Typography color={currentItem.voucher_type ? 'black' : 'white'} variant='button'>{currentItem?.account_code || 'a'}</Typography>
                                        <Typography color={currentItem.voucher_type ? 'black' : 'white'} variant='button'>{currentItem?.type || 'a'}</Typography>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.debit_amount || 0)}</Typography>

                                    </Stack>
                                </Stack>

                                <Stack direction='row' gap='16px'>
                                    <Stack direction='column' gap='8px'>
                                        <Typography color='#ccc' variant='button'>credit_amount</Typography>
                                        <Typography color='#ccc' variant='button'>debit_balance_amount</Typography>
                                        <Typography color='#ccc' variant='button'>credit_balance_amount</Typography>
                                        <Typography color='#ccc' variant='button'>created_date</Typography>
                                    </Stack>
                                    <Stack direction='column' gap='8px'>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.credit_amount || 0)}</Typography>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.debit_balance_amount || 0)}</Typography>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.credit_balance_amount || 0)}</Typography>
                                        <Typography variant='button'>{moment(currentItem.created_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>
                </Fade>
            </Modal > : null}


        </Box >
    )
}

export default TabHistory
