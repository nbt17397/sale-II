import { Box, Button, IconButton, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import { DATE_FORMAT_TO_DISPLAY, UserContext, formatterRevenue } from 'src/global'
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, gridClasses } from '@mui/x-data-grid'
import { viVN } from '@mui/x-data-grid/locales';
import ImportExcel from 'src/sections/@dashboard/app/ImportExcel'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import * as XLSX from 'xlsx';


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


function DeleteButton({ isEditing, id, line_ids, onUpdate, }) {
    const { unlink, showDialog, read, showNotification } = React.useContext(UserContext);
    const [params] = useSearchParams()

    const handleDelete = async (event, id) => {
        event.stopPropagation();
        const result = await unlink('account.purchase.report.line', [id]);
        const json = await read('account.purchase.report', [parseInt(params.get('id'), 10)], ["line_ids"])
        onUpdate(json.result[0].line_ids)
        // getDetailInfo();
        if (result.error) {
            showDialog('', result.error.data.message);
        }
        showNotification('', 'Đã xóa dữ liệu', 'success')
    };

    return (
        <Stack direction='row' justifyContent='space-between'>
            <Tooltip title='Xóa'>
                <IconButton onClick={(event) => handleDelete(event, id)} aria-label="delete">
                    <DeleteOutlineOutlinedIcon sx={{ width: 24, height: 24, color: '#ccc' }} />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}


const TabPurchaseLine = ({ line_ids, id, detailDepen, model, getData, onCreateData, handleDataEditing }) => {
    console.log('id', id);
    const [params, setParams] = useSearchParams()
    const [fieldOfView, setFieldOfView] = React.useState({})
    const { loadViews, showDialog, searchRead, showNotification, setLoading, loading, read, unlink } = useContext(UserContext)
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('userKey'))
    const isMobile = useMediaQuery('(max-width:600px)');
    const [detail, setDetail] = useState([])
    const [open, setOpen] = useState(false) // for setting pop up

    const handleOpen = () => setOpen(true);
    const handleClose = () => { setOpen(false); params.delete('create'); setParams(params) }

    const [selectionModel, setSelectionModel] = useState([]);



    const getFieldsDetail = async () => {
        const json = await loadViews(model, ['list'])
        const result = json.result.fields;
        setFieldOfView(result)
    }

    const getDetailInfo = async () => {
        setLoading(true)
        const { result, error } = await searchRead(model, ['payment_date', 'voucher_ref', 'invoice_date', 'invoice_ref', 'branch_name',
            'product_name', 'product_code', 'product_name', 'partner_code', 'unit_name', 'qty_purchased', 'product_price', 'price_total',
            'product_categ_name', 'product_categ_id', 'partner_name'
        ], [["id", "in", line_ids]], 'id desc');
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
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{moment(params.row.payment_date).add(7, 'hours').format(DATE_FORMAT_TO_DISPLAY)
                    || ''}
                </Typography></Stack>
            },
            headerAlign: 'left',
            align: 'left',
        },

        {
            field: 'voucher_ref',
            headerName: getLabel('Số chứng từ'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.voucher_ref || ''}
                </Typography></Stack>
            },
            headerAlign: 'left',
            align: 'left',


        },
        {
            field: 'invoice_date',
            headerName: getLabel('Ngày hóa đơn'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{moment(params.row.invoice_date).add(7, 'hours').format(DATE_FORMAT_TO_DISPLAY) || ''}
                </Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',

        },
        {
            field: 'invoice_ref',
            headerName: getLabel('Số hóa đơn'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.invoice_ref || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',

        },
        {
            field: 'product_name',
            headerName: getLabel('Tên hàng'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.product_name || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',

        },
        {
            field: 'product_code',
            headerName: getLabel('Mã hàng'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.product_code || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'partner_name',
            headerName: getLabel('Tên đối tác'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.partner_name || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',
            flex: 0.3

        },
        {
            field: 'partner_code',
            headerName: getLabel('Mã đối tác'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.partner_code || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',

        },
        {
            field: 'unit_name',
            headerName: getLabel('ĐVT'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.unit_name || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'qty_purchased',
            headerName: getLabel('Số lượng mua'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params.row.qty_purchased || ''}</Typography></Stack>
            },
            headerAlign: 'left',
            align: 'center'
        },
        {
            field: 'product_price',
            headerName: getLabel('Đơn giá'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{formatterRevenue.format(params.row.product_price) || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'price_total',
            headerName: getLabel('Giá trị mua'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{formatterRevenue.format(params.row.price_total) || ''}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'product_categ_id',
            headerName: getLabel('Tên nhóm VTHH'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.product_categ_id[1] || ''}</Typography></Stack>
            },
            headerAlign: 'right',
            align: 'right',
            flex: 0.5

        },
        {
            field: 'branch_name',
            headerName: getLabel('Chi nhánh'),

            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='caption'>{params?.row?.branch_name || ''}</Typography></Stack>
            },
            headerAlign: 'right',
            align: 'right',
            flex: 0.3
        },
        {
            field: 'delete',
            headerName: '',
            width: 0.2,
            renderCell: (params) => {
                return <DeleteButton onUpdate={onCreateData} line_ids={line_ids} id={params.row.id}
                    handleDataEditing={handleDataEditing}
                />
            },
        }
    ];

    const handleRowClick = (id = '') => {
        navigate({ pathname: '', search: createSearchParams({ id }).toString() });
    };

    const handleDelete = async () => {
        setLoading(true)
        await Promise.all(
            selectionModel.map(async (item) => {
                const dataCreate = await unlink('account.purchase.report.line', item);
                return dataCreate;
            })
        );

        const json = await read('account.purchase.report', [parseInt(params.get('id'), 10)], ["line_ids"])
        console.log('json', json);
        const results = json.result[0].line_ids
        onCreateData(results);
        // getData(ids)
        setLoading(false)
        showNotification('', 'Đã xóa dữ liệu', 'success')
    }


    const expData = () => {
        console.log('selectionModel', selectionModel);
        console.log('detailMemo', detailMemo);
        const filteredObjects = detailMemo.filter(obj => selectionModel.includes(obj.id));
        console.log('filteredObjects', filteredObjects);
        const exp = filteredObjects.map((x) => ({
            'Ngày hoạch toán': x.payment_date, 'Số chứng từ': x.voucher_ref, 'Ngày hóa đơn': x.invoice_date,
            'Số hóa đơn': x.invoice_ref, 'Tên hàng': x.product_name, 'Mã hàng': x.product_code, 'Tên đối tác': x.product_name,
            'Mã đối tác': x.product_code, 'ĐVT': x.unit_name, 'Số lượng': x.qty_purchased, 'Giá trị mua': x.product_price,
            'Tên nhóm VTHH': x.product_categ_id[1], 'Chi nhánh': x.branch_name
        }))

        const workbook = XLSX.utils.book_new();

        // Tạo một worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(exp);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Tạo file Excel và tải xuống
        XLSX.writeFile(workbook, 'So_chi_tiet_mua_hang.xlsx');
    }

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <Stack direction='column' gap='8px' alignItems='flex-start' marginBottom='16px'>
                    <Typography variant='h6' textTransform='uppercase'>Thông tin </Typography>
                    <Stack direction='row' gap='8px'>
                        {selectionModel.length > 0 ? <Button variant='contained' color='error' onClick={() => { handleDelete() }}>Xóa dòng đã chọn</Button> : null}
                        {selectionModel.length > 0 ? <Button variant='contained' color='primary' onClick={() => { expData() }}>Xuất dữ liệu đã chọn</Button> : null}
                        <Stack direction='row' gap='4px' justifyContent='center'>
                            <ImportExcel ids={id} onCreateData={onCreateData} getData={getData} />
                        </Stack>
                    </Stack>
                </Stack>
            </GridToolbarContainer >
        );
    }




    useEffect(() => {
        getFieldsDetail();
        getDetailInfo();
    }, [id, line_ids]);

    return (
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
                checkboxSelection
                className="custom-dataGrid"
                rows={detailMemo}
                columns={columns}
                pageSize={10}
                loading={loading}
                autoHeight {...detailMemo}
                localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                // onRowDoubleClick={(row) => { handleRowClick(row.id); }}
                initialState={{
                    ...detailMemo.initialState,
                    pagination: { paginationModel: { pageSize: 80 } },
                }}
                rowsPerPageOptions={[5]}
                slots={{
                    toolbar: CustomToolbar,
                }}
                onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                } />
        </Box>
    )
}

export default TabPurchaseLine
