
import * as React from 'react';

import { Backdrop, Box, Button, Divider, Fade, useMediaQuery, IconButton, Modal, Stack, Tooltip, Typography, Pagination, Checkbox, styled, alpha } from '@mui/material';
import { DataGrid, GridToolbar, GridToolbarContainer, gridClasses } from '@mui/x-data-grid';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import { UserContext } from 'src/global';
import { viVN } from '@mui/x-data-grid/locales';
import { useState } from 'react';
// import DetailBidding from 'src/pages/opportunity_project/DetailBidding';

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

function DeleteButton({ isEditing, id, department_ids, onCreateDeparment }) {
    const handleDelete = async (event, id) => {
        event.stopPropagation();
        const filtered_ids = department_ids.filter(element => element !== id);
        onCreateDeparment(filtered_ids, true)
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
const TabDeparment = ({ id, isEditing, department_ids, model, detailDepen, onCreateDeparment, onCreateEmployee }) => {
    const [fieldOfView, setFieldOfView] = React.useState({})
    const [detail, setDetail] = React.useState([])
    const { loadViews, showDialog, searchRead } = React.useContext(UserContext)
    const [open, setOpen] = React.useState(false) // for setting pop up
    const [currentPage, setCurrentPage] = useState(1);

    const getFieldsDetail = async () => {
        const json = await loadViews(model, ['list'])
        const result = json.result.fields;
        setFieldOfView(result)
    }

    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

    const getDetailInfo = async (limit, offset) => {
        const { result, error } = await searchRead(model, ['display_name', 'analytic_account_id', 'is_deparment', 'manager_id', 'parent_id'],
            [['id', 'in', department_ids],], { sort: 'id desc', limit, offset });
        if (error) {
            showDialog('', error.data.message);
        } else {
            setDetail(result.records);
        }
        console.log('info detail', result);
    };
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const detailMemo = React.useMemo(() =>
        detail.map((item) => ({ ...item, })),

        [detail]
    );

    console.log('detailMemo', detailMemo);

    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'display_name',
            headerName: getLabel('Tên phòng ban'),
            renderCell: (params) =>
                params?.row?.display_name || '',
            flex: 1
        },
        {
            field: 'analytic_account_id',
            headerName: getLabel('Tài khoản quản trị'),
            renderCell: (params) =>
                params?.row?.analytic_account_id[1] || '',
            flex: 1
        },
        {
            field: 'is_deparment',
            headerName: getLabel('is_deparment'),
            renderCell: (params) => <Checkbox checked={params?.row?.is_deparment} />,
            headerAlign: 'left',
            align: 'left',
            flex: 1

        },
        {
            field: 'manager_id',
            headerName: getLabel('Quản lý'),
            renderCell: (params) =>
                params?.row?.manager_id[1] || '',
            flex: 1
        },
        {
            field: 'parent_id',
            headerName: getLabel('Phòng/Ban cấp trên'),
            renderCell: (params) =>
                params?.row?.parent_id[1] || '',
            flex: 1
        },
        {
            field: 'delete',
            headerName: '',
            width: 0.2,
            renderCell: (params) => {
                return <DeleteButton onCreateDeparment={onCreateDeparment} department_ids={department_ids} id={params.row.id}

                />
            },
        }
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

    function CustomToolbar() {
        const page = department_ids.length
        return (
            <GridToolbarContainer>
                <Stack width='100%' direction='row' gap='8px' justifyContent='space-between' alignItems='center'>
                    <Stack direction='column'>
                        <Typography variant='h6' textTransform='uppercase'>Danh sách phòng ban</Typography>
                        <Button size='small' variant='contained' onClick={() => { handleOpen() }} sx={{ textTransform: 'initial', boxShadow: 'none', width: '96px' }}>Thêm mới</Button>
                    </Stack>
                    <Pagination
                        onChange={handlePageChange}
                        page={currentPage}
                        count={Math.ceil(page / 40)} />
                </Stack>
            </GridToolbarContainer >
        );
    }



    React.useEffect(() => {
        getFieldsDetail();
        getDetailInfo(40, 0);
    }, [id, department_ids]);

    return (
        <>
            <Box sx={{ width: '100%' }}>
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
                    }} className="data-grid grid-dashboard"
                    rows={detailMemo}
                    columns={columns}
                    pageSize={10}
                    autoHeight {...detailMemo}
                    getRowHeight={() => 'auto'}

                    initialState={{
                        ...detailMemo.initialState,
                        pagination: { paginationModel: { pageSize: 40 } },
                    }}
                    localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    } />

            </Box>
            <Modal

                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <Stack direction='column' >
                            <Stack alignItems='center' direction={'row'} justifyContent='space-between'>
                                <Typography sx={{ textTransform: 'capitalize' }} id="transition-modal-title" variant="h6" component="h2">
                                    Phòng ban
                                </Typography>
                                <IconButton onClick={() => handleClose()} aria-label="close" color="primary">
                                    <CloseOutlinedIcon sx={{ width: 24, height: 24, color: '#ccc' }} />
                                </IconButton>
                            </Stack>
                            <Divider />
                            <ListDeparment handleClose={handleClose} getLabel={getLabel} onCreateDeparment={onCreateDeparment} department_ids={detail} />
                        </Stack>
                    </Box>
                </Fade>
            </Modal >
        </>)
}


const ListDeparment = ({ getLabel, onCreateDeparment, department_ids, handleClose }) => {
    const { searchRead, showDialog } = React.useContext(UserContext)
    const [list, setList] = React.useState([])
    const [selectionModel, setSelectionModel] = React.useState([]);
    const isMobile = useMediaQuery('(max-width:600px)');

    const getList = async () => {
        const json = await searchRead('hr.department', ['display_name', 'manager_id'], [['id', '!=', 311]])
        if (json.error) {
            showDialog('', json.error.data.message);
            return
        }
        const result = json.result.records;
        const filteredArray = result.filter(item => !department_ids.some(other => item.id === other.id))// loại bỏ các đối tượng trùng lắp

        setList(filteredArray);

        console.log('info detail', result);
    }

    const listMemo = React.useMemo(() =>
        list.map((item) => ({ ...item, })),
        [list]
    );

    // const handleSelectionModelChange = (newSelectionModel) => {
    //     setSelectionModel(newSelectionModel);

    //     console.log(newSelectionModel);
    // };

    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'display_name',
            headerName: getLabel('Tên phòng ban'),
            renderCell: (params) =>
                params?.row?.display_name || '',
            flex: 1
        },

        {
            field: 'manager_id',
            headerName: getLabel('Quản lý'),
            renderCell: (params) =>
                params?.row?.manager_id[1] || '',
            flex: 0.5
        },
    ];


    React.useEffect(() => {
        getList()
    }, [])

    return (
        <Box sx={{ width: isMobile ? '350px' : '800px' }}>
            <DataGrid
                checkboxSelection
                sx={{ border: 0 }}
                className="data-grid grid-dashboard"
                rows={listMemo}
                columns={columns}
                pageSize={10}
                autoHeight
                initialState={{
                    ...listMemo.initialState,
                    pagination: { paginationModel: { pageSize: 8 } },
                }}
                localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                }}
                // selectionModel={selectionModel}
                components={{
                    Toolbar: GridToolbar,
                }}
                toolbarOptions={{
                    searchPlaceholder: 'Tìm kiếm...',
                }}
            />

            <Button onClick={() => { onCreateDeparment(selectionModel, false); handleClose() }} variant='contained' sx={{ boxShadow: 'none' }}>Xác  nhận </Button>
        </Box>
    )
}


export default TabDeparment 