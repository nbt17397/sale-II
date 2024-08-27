import { Backdrop, Box, Button, Fade, IconButton, Modal, Stack, Typography } from '@mui/material';
import moment from 'moment';
import PropTypes from 'prop-types'
import React, { Component, useContext } from 'react'
import { DATE_FORMAT, DATE_FORMAT_TO_DISPLAY, UserContext } from 'src/global';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import { viVN } from '@mui/x-data-grid/locales';
import { DataGrid } from '@mui/x-data-grid';
import { useSearchParams } from 'react-router-dom';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    borderRadius: '12px',
    padding: '24px',
    width: '80%',
    maxHeight: '90vh',
    overflow: 'auto'
};

class ImportExcel extends Component {
    columns = [
        { field: 'id', headerName: '#', width: 90 },
        {
            field: 'payment_date',
            headerName: 'Payment Date',
            renderCell: (params) =>
                moment(params.row.payment_date).format(DATE_FORMAT_TO_DISPLAY),
        },
        {
            field: 'voucher_ref',
            headerName: 'Voucher Ref',
            renderCell: (params) => params.row.voucher_ref,
            headerAlign: 'center',
            align: 'center'

        },
        {
            field: 'invoice_date',
            headerName: 'Invoice Date',
            renderCell: (params) => moment(params.row.invoice_date).format(DATE_FORMAT_TO_DISPLAY),
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'invoice_ref',
            headerName: 'Invoice Ref',
            renderCell: (params) => params.row.invoice_ref,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'product_name',
            headerName: 'Product Name',
            renderCell: (params) => params.row.product_name,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'product_code',
            headerName: 'Product Code',
            renderCell: (params) => params.row.product_code,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'partner_name',
            headerName: 'Partner Name',
            renderCell: (params) => params.row.partner_name,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'partner_code',
            headerName: 'Partner Code',
            renderCell: (params) => params.row.partner_code,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'unit_name',
            headerName: 'Unit Name',
            renderCell: (params) => params.row.unit_name,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'qty_purchased',
            headerName: 'Qty Purchased',
            renderCell: (params) => params.row.qty_purchased,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'product_price',
            headerName: 'Product Price',
            renderCell: (params) => params.row.product_price,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'price_total',
            headerName: 'Price Total',
            renderCell: (params) => params.row.price_total,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'product_categ_name',
            headerName: 'Product Categ Name',
            renderCell: (params) => params.row.product_categ_name,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'branch_name',
            headerName: 'Branch',
            renderCell: (params) => params.row.branch_name,
            headerAlign: 'center',
            align: 'center'
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

    constructor(props) {
        super(props);
        this.state = {
            detailFile: [],
            open: false,
            selectionModel: [],
            selectedRowsData: []
        };
    }

    handleSelectionModelChange = (newSelectionModel) => {
        this.setState({ selectionModel: newSelectionModel })
        const { detailFile } = this.state

        const selectedRows = newSelectionModel.map((selectedId) => {
            return detailFile.find((row) => row.id === selectedId);
        });

        console.log('selectedRows', selectedRows);

        this.setState({ selectedRowsData: selectedRows })
    };

    handleFileUpload = async (e) => {
        const { showDialog, params, ids } = this.props
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'arraybuffer' });

                // Tìm sheet có tên 'Action Plan'
                const sheetNameToFind = `SỔ CHI TIẾT MUA HÀNG`;
                console.log('sheetNameToFind', sheetNameToFind);
                const foundSheet = workbook.Sheets[sheetNameToFind];

                if (foundSheet) {
                    // Đặt phạm vi tùy chỉnh bắt đầu từ dòng 7 và cột A (0-indexed)
                    const customRange = {
                        s: { r: 4, c: 0 }, // Dòng bắt đầu từ dòng 7 (6 là 0-indexed)
                        e: { r: XLSX.utils.decode_range(foundSheet['!ref']).e.r, c: 14 }, // Cột kết thúc là cột F (5 là 0-indexed)
                    };



                    // Lấy dữ liệu từ phạm vi tùy chỉnh
                    const data = XLSX.utils.sheet_to_json(foundSheet, { header: 1, range: customRange });

                    const outputArray = data.map((item, index) => {
                        // Kiểm tra xem mảng item có đủ dài không
                        if (Array.isArray(item) && item.length >= 3) {
                            // Loại bỏ khoản trắng ở đầu và cuối chuỗi (nếu item[1] là chuỗi)
                            const voucher_ref = typeof item[1] === 'string' ? item[1].trim() : item[1];
                            const invoice_ref = item[3]
                            const partner_code = item[4]
                            const partner_name = item[5]
                            const product_code = typeof item[6] === 'string' ? item[6].trim() : item[6];
                            const product_name = item[7]
                            const unit_name = item[8]
                            const qty_purchased = item[9]
                            const product_price = item[10]
                            const price_total = item[11]
                            // const product_categ_name = item[13]
                            // const product_categ_code = item[12]
                            const branch_name = item[14]
                            const purchase_report_id = ids


                            // Chuyển đổi sang định dạng MM/DD/YYYY
                            const datePayment = new Date((item[0] - 25569) * 86400 * 1000); // 25569 là sự chênh lệch giữa ngày 1/1/1970 và ngày 1/1/1900
                            const monthPayment = (datePayment.getMonth() + 1).toString().padStart(2, '0'); // Lưu ý: Tháng tính từ 0, nên cộng thêm 1 và định dạng thành chuỗi 2 chữ số
                            const dayPayment = datePayment.getDate().toString().padStart(2, '0');
                            const yearPayment = datePayment.getFullYear();
                            const paymentDate = `${monthPayment}/${dayPayment}/${yearPayment}`;


                            const dateInvoice = new Date((item[2] - 25569) * 86400 * 1000);
                            const monthInvoice = (dateInvoice.getMonth() + 1).toString().padStart(2, '0'); // Lưu ý: Tháng tính từ 0, nên cộng thêm 1 và định dạng thành chuỗi 2 chữ số
                            const dayInvoice = dateInvoice.getDate().toString().padStart(2, '0');
                            const yearInvoice = dateInvoice.getFullYear();
                            const invoiceDate = `${monthInvoice}/${dayInvoice}/${yearInvoice}`;

                            // if (!moment(datePayment).isValid() || !moment(dateInvoice).isValid()) {
                            //     showDialog('Thông báo', 'Dữ liệu bị để trống vui lòng cập nhật thời gian thực hiện đầy đủ trước khi import dữ liệu.')
                            // }

                            return {
                                id: index + 1,
                                payment_date: moment(paymentDate).format(DATE_FORMAT),
                                invoice_date: moment(invoiceDate).format(DATE_FORMAT),
                                voucher_ref,
                                invoice_ref,
                                partner_code,
                                partner_name,
                                product_code,
                                product_name,
                                unit_name,
                                qty_purchased,
                                product_price,
                                price_total,
                                // product_categ_name,
                                // product_categ_code,
                                purchase_report_id,
                                branch_name
                            };
                        }
                        // Nếu mảng không đủ dài, hoặc item[1] không phải là chuỗi, trả về giá trị mặc định
                        return {
                            id: index + 1,
                            payment_date: null,
                            invoice_date: null,
                            voucher_ref: '',
                            invoice_ref: '',
                            partner_code: '',
                            partner_name: '',
                            product_code: '',
                            product_name: '',
                            unit_name: '',
                            qty_purchased: '',
                            product_price: '',
                            price_total: '',
                            // product_categ_name: '',
                            // product_categ_code: '',
                            purchase_report_id: '',
                            branch_name: ''
                        };
                    });


                    console.log(outputArray.filter(x => x.invoice_date && x.partner_code && x.product_code), '>>>>>>>outputArray');
                    const result = outputArray.filter(x => x.invoice_date && x.partner_code && x.product_code)

                    this.setState({ detailFile: result, open: true })

                } else {
                    this.props.showDialog('Thông báo', 'File import không đúng định dạng vui lòng import đúng định dạng file để tiến hành tạo dữ liệu')
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    async handleCreate() {
        const { selectedRowsData } = this.state;
        const { params, create, setLoading, read, showDialog, showNotification, onCreateData } = this.props;

        try {
            setLoading(true);
            const dataToCreate = selectedRowsData.map(({ id, ...rest }) => rest);

            const createdData = await Promise.all(
                dataToCreate.map(async (item) => {
                    try {
                        return await create('account.purchase.report.line', item);
                    } catch (error) {
                        if (error.data?.name === 'odoo.exceptions.ValidationError') {
                            showDialog('Not Found', error.data.message);
                        } else if (error.data?.name === 'psycopg2.errors.InvalidDatetimeFormat') {
                            showDialog('Sai định dạng thời gian', 'Vui lòng kiểm tra lại dữ liệu');
                        } else {
                            showDialog('Thông báo', error.data?.name || 'Lỗi không xác định');
                        }
                        return null;
                    }
                })
            );

            const successfulCreations = createdData.filter(item => item !== null);

            if (successfulCreations.length > 0) {
                const json = await read('account.purchase.report', [parseInt(params.get('id'), 10)], ["line_ids"]);
                const results = json.result[0].line_ids;
                onCreateData(results);
                showNotification('', 'Đã tạo dữ liệu mới');
            } else {
                showNotification('Cảnh báo', 'Không có dữ liệu nào được tạo thành công');
            }
        } catch (error) {
            console.error('Lỗi khi tạo dữ liệu:', error);
            showDialog('Lỗi', 'Đã xảy ra lỗi khi tạo dữ liệu');
        } finally {
            setLoading(false);
        }
    }


    render() {
        const { detailFile, open, selectionModel, selectedRowsData } = this.state
        return (
            <>
                <Button size='small' color='success' sx={{ boxShadow: 'none' }} variant='contained' component="label">
                    <input type="file" accept=".xlsx" onChange={this.handleFileUpload} style={{ display: 'none' }} />
                    Import .excel
                </Button>

                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={open}
                    onClose={this.handleClose}
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
                            <Stack direction='column' gap='16px' >
                                <Stack alignItems='center' direction={'row'} justifyContent='space-between'>
                                    <Typography sx={{ textTransform: 'capitalize' }} id="transition-modal-title" variant="h6" component="h2">
                                        Chọn dữ liệu
                                    </Typography>
                                    <IconButton onClick={() => this.handleClose()} aria-label="close" color="primary">
                                        <CloseIcon sx={{ width: 24, height: 24, color: '#ccc' }} />
                                    </IconButton>
                                </Stack>
                                {/* <Divider /> */}
                                <Button sx={{ width: '125px' }} onClick={() => { this.handleCreate() }} variant='contained' disabled={selectedRowsData.length === 0}>Tạo dữ liệu</Button>

                                <DataGrid
                                    checkboxSelection
                                    selectionModel={selectionModel}
                                    onRowSelected={(row) => {
                                        console.log('Dòng được chọn:', row.data);
                                    }}
                                    onRowSelectionModelChange={this.handleSelectionModelChange}
                                    sx={{ border: 0 }}
                                    className="data-grid grid-dashboard"
                                    rows={detailFile}
                                    columns={this.columns}
                                    pageSize={7}
                                    autoHeight {...detailFile}
                                    initialState={{
                                        ...detailFile.initialState,
                                        pagination: { paginationModel: { pageSize: 7 } },
                                    }}
                                    localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                                    rowsPerPageOptions={[5]}
                                />

                            </Stack>
                        </Box>
                    </Fade >
                </Modal >
            </>
        )
    }
}

export default function (props) {
    const { ids, getData } = props
    const { setLoading, create, read, showDialog, searchRead, showNotification, } = useContext(UserContext)
    const [params] = useSearchParams()
    return <ImportExcel {...props} {...{
        setLoading, create, read, showDialog, searchRead, showNotification, params, ids, getData
    }} />;

}
