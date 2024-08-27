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

const TabGLA = ({ line_ids, id, detailDepen, model, getData, onCreateData }) => {
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
        const { result, error } = await searchRead(model, ["payment_date", "voucher_date", "voucher_ref", "invoice_date",
            "invoice_ref", "description", "journal_memo", "account_id", "corresponding_account_id", "debit_amount", "credit_amount",
            "closing_debit_amount", "closing_credit_amount", "voucher_type", "partner_id", "partner_code", "business_name", "branch_id"
        ], [["id", "in", line_ids]], { sort: 'id desc', limit, offset });
        if (error) {
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
            field: 'payment_date',
            headerName: getLabel('Ngày hoạch toán'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{moment(params.row.payment_date).format(DATE_FORMAT_TO_DISPLAY) || ''}</Typography></Stack> },

            headerAlign: 'left',

        },
        {
            field: 'voucher_ref',
            headerName: getLabel('Số chứng từ'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.voucher_ref || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',

        },
        {
            field: 'invoice_date',
            headerName: getLabel('Ngày hóa đơn'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{moment(params.row.invoice_date).format(DATE_FORMAT_TO_DISPLAY) || ''}</Typography></Stack> },

            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'invoice_ref',
            headerName: getLabel('Số hóa đơn'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.invoice_ref || ''}</Typography></Stack> },

            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'description',
            headerName: getLabel('Diễn giải chung'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.description || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
            width: 200
        },
        {
            field: 'journal_memo',
            headerName: getLabel('Diễn giải'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.journal_memo || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
            width: 200
        },
        {
            field: 'corresponding_account_id',
            headerName: getLabel('Tài khoản đối ứng'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.corresponding_account_id || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
            width: 200
        },
        {
            field: 'debit_amount',
            headerName: getLabel('Phát sinh nợ'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{formatterRevenue.format(params?.row?.debit_amount || 0)}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'credit_amount',
            headerName: getLabel('Phát sinh có'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{formatterRevenue.format(params?.row?.credit_amount || 0)}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'closing_debit_amount',
            headerName: getLabel('Nợ cuối kỳ'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{formatterRevenue.format(params?.row?.closing_debit_amount || 0)}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'closing_credit_amount',
            headerName: getLabel('Có cuối kỳ'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{formatterRevenue.format(params?.row?.closing_credit_amount || 0)}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'voucher_type',
            headerName: getLabel('Loại chứng từ'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.voucher_type || ''}</Typography></Stack> }
            ,
            headerAlign: 'left',
            align: 'left',
        },
        // {
        //     field: 'partner_id',
        //     headerName: getLabel('Partner'),
        //     renderCell: (params) => params?.row?.partner_id[1] || '',
        //     headerAlign: 'left',
        //     align: 'left',
        // },
        {
            field: 'partner_code',
            headerName: getLabel('Mã đối tác'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.partner_code || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'business_name',
            headerName: getLabel('Mã thống kê'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.business_name || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'branch_id',
            headerName: getLabel('Công ty'),
            renderCell: (params) => { return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.branch_id[1] || ''}</Typography></Stack> },

            headerAlign: 'left',
            align: 'left',
        },
        // {
        //     field: 'delete',
        //     headerName: '',
        //     flex: 0.1,
        //     align: 'center',
        //     renderCell: (params) => {
        //         return <DeleteButton id={params.row.id} isEditing={isEditing}
        //             getDetailInfoArchive={getDetailInfoArchive}
        //             getDetailInfo={getDetailInfo} onCreateData={onCreateData}
        //         />
        //     },
        // }
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
                        <Typography variant='h6' textTransform='uppercase'>Chi tiết GLA</Typography>
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
                                        <Typography color='#ccc' variant='button'>Payment Date</Typography>
                                        <Typography color='#ccc' variant='button'>Voucher Date</Typography>
                                        <Typography color='#ccc' variant='button'>Voucher Ref</Typography>
                                        <Typography color='#ccc' variant='button'>Invoice Date</Typography>
                                        <Typography color='#ccc' variant='button'>Description	</Typography>
                                        <Typography color='#ccc' variant='button'>Journal Memo</Typography>
                                        <Typography color='#ccc' variant='button'>Account</Typography>
                                        <Typography color='#ccc' variant='button'>Corresponding Account</Typography>
                                    </Stack>
                                    <Stack direction='column' gap='8px'>
                                        <Typography variant='button'>{moment(currentItem.payment_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography>
                                        <Typography variant='button'>{moment(currentItem.voucher_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography>
                                        <Typography color={currentItem.voucher_type ? 'black' : 'white'} variant='button'>{currentItem?.voucher_ref || 'a'}</Typography>
                                        <Typography variant='button'>{moment(currentItem?.invoice_date).add(7, 'hours').format(DATE_TIME_FORMAT_TO_DISPLAY)}</Typography>
                                        <Typography color={currentItem.description ? 'black' : 'white'} variant='button'>{currentItem?.description || 'a'}</Typography>
                                        <Typography color={currentItem.journal_memo ? 'black' : 'white'} variant='button'>{currentItem?.journal_memo || 'a'}</Typography>
                                        <Typography color={currentItem.account_id[1] ? 'black' : 'white'} variant='button'>{currentItem?.account_id[1] || 'a'}</Typography>
                                        <Typography color={currentItem.corresponding_account_id[1] ? 'black' : 'white'} variant='button'>{currentItem?.corresponding_account_id[1] || 'a'}</Typography>
                                    </Stack>
                                </Stack>

                                <Stack direction='row' gap='16px'>
                                    <Stack direction='column' gap='8px'>
                                        <Typography color='#ccc' variant='button'>Debit Amount</Typography>
                                        <Typography color='#ccc' variant='button'>Credit Amount</Typography>
                                        <Typography color='#ccc' variant='button'>Closing Debit Amount</Typography>
                                        <Typography color='#ccc' variant='button'>Closing Credit Amount</Typography>
                                        <Typography color='#ccc' variant='button'>Voucher Type</Typography>
                                        <Typography color='#ccc' variant='button'>Partner Code</Typography>
                                        <Typography color='#ccc' variant='button'>Business Name</Typography>
                                        <Typography color='#ccc' variant='button'>Branch</Typography>
                                    </Stack>
                                    <Stack direction='column' gap='8px'>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.debit_amount || 0)}</Typography>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.credit_amount || 0)}</Typography>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.closing_debit_amount || 0)}</Typography>
                                        <Typography variant='button'>{formatterRevenue.format(currentItem?.closing_credit_amount || 0)}</Typography>
                                        <Typography color={currentItem.voucher_type ? 'black' : 'white'} variant='button'>{currentItem?.voucher_type || 'a'}</Typography>
                                        <Typography color={currentItem.partner_code ? 'black' : 'white'} variant='button'>{currentItem?.partner_code || 'a'}</Typography>
                                        <Typography color={currentItem.business_name ? 'black' : 'white'} variant='button'>{currentItem?.business_name || 'a'}</Typography>
                                        <Typography color={currentItem.branch_id[1] ? 'black' : 'white'} variant='button'>{currentItem?.branch_id[1] || 'a'}</Typography>
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

export default TabGLA
