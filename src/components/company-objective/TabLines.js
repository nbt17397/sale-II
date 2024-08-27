import { Autocomplete, Backdrop, Box, Button, Checkbox, Fade, FormControl, FormControlLabel, IconButton, MenuItem, Modal, Pagination, Select, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material'
import moment from 'moment'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom'
import { DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue, getFieldSelection, routes } from 'src/global'
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, GridActionsCellItem, GridRowEditStopReasons, GridRowModes, GridToolbarContainer, GridToolbarFilterButton, gridClasses } from '@mui/x-data-grid'
import { viVN } from '@mui/x-data-grid/locales';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';

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

// function UpdatePlan({ id, setIsEditing, isEditing }) {
//     const { showDialog, write } = React.useContext(UserContext);

//     const archiveHandle = async (event, id) => {
//         event.stopPropagation();

//     }

//     return (
//         <Stack direction='row' justifyContent='space-between'>
//             {isEditing ?
//                 <>
//                     <Tooltip title='xác nhận'>
//                         <IconButton onClick={() => { }} aria-label="done">
//                             <CheckCircleIcon sx={{ width: 24, height: 24, color: 'green' }} />
//                         </IconButton>
//                     </Tooltip>
//                     <Tooltip title='hủy'>
//                         <IconButton onClick={() => setIsEditing(false)} aria-label="cancel">
//                             <CancelIcon sx={{ width: 24, height: 24, color: 'red' }} />
//                         </IconButton>
//                     </Tooltip>
//                 </>
//                 : <Tooltip title='Cập nhật kế hoạch'>
//                     <IconButton onClick={() => setIsEditing(true)} aria-label="update">
//                         <DriveFileRenameOutlineIcon sx={{ width: 24, height: 24, color: '#1876D2' }} />
//                     </IconButton>
//                 </Tooltip>}

//         </Stack>
//     );
// }

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

const styleResult = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
    borderRadius: '12px',
    padding: '24px',
    width: '85%',
    maxHeight: '90vh',
    overflow: 'auto'
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
        beforeStartDate: prevMonthStart.getTime(),
        beforeEndDate: prevMonthEnd.getTime()
    };
}



const TabLines = ({ line_ids, id, detailDepen, model, getData, viewOnly, starting, ending, branch, business }) => {
    console.log('id', starting);
    const [params, setParams] = useSearchParams()
    const [fieldOfView, setFieldOfView] = React.useState({})
    const { loadViews, showDialog, searchRead, showNotification, setLoading, loading, write, psms,
        getControlIndexFilter, getRevenuesFilter, getSellingExpensessFilter, getManagementExpensesFilter,
        accessRights
    } = useContext(UserContext)
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('userKey'))
    const isMobile = useMediaQuery('(max-width:600px)');
    const [detail, setDetail] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState(0)
    const [rowModesModel, setRowModesModel] = useState({});
    const [objective_type, setObjectiveType] = useState({ text: 'Control Index', value: 'control_index' })
    const [listObjectiveType, setListObjectiveType] = useState([])
    const [data, setData] = useState([])
    const [open, setOpen] = useState(false)
    const [crud, setCRUD] = useState({})



    const getFieldsDetail = async () => {
        const json = await loadViews(model, ['list'])
        const label = json.result.fields
        const listObjective = getFieldSelection(label, 'objective_type')
        const listObjectiveVie = listObjective.map((x) => ({
            text: x.value === 'control_index' ? 'Chỉ số kiểm soát' :
                x.value === 'revenue' ? 'Doanh thu & lợi nhuận gộp' :
                    x.value === 'selling_expenses' ? 'Chi phí bán hàng' :
                        x.value === 'budget_management' ? 'Chi phí quản lý' : 'Chi phí quản lý - Tỉ lệ', value: x.value
        }))
        console.log('listObjective', listObjective);
        setListObjectiveType(listObjectiveVie)
        setFieldOfView(label)
    }

    const getDetailInfo = async (limit, offset, type) => {
        if (!psms.includes('company.objective.line')) {
            psms.push('company.objective.line');
        }
        const modelCurrent = await JSON.stringify(psms);
        await localStorage.setItem('psm', modelCurrent)

        const access = await accessRights()

        console.log('access', access.result);


        const permissions = await psms.filter((key) => Object.prototype.hasOwnProperty.call(access.result, key))
            .map((key) => ({
                name: key,
                ...access.result[key]
            }));

        const currentPes = await permissions.filter(x => x.name === 'company.objective.line')
        await setCRUD(...currentPes)


        setLoading(true)
        const { result, error } = await searchRead(model, ['name', 'company_objective_id', 'plan',
            'result', 'department_ids', 'unit', 'is_active', 'objective_type'
        ], [["id", "in", line_ids], ["objective_type", "=", type]], { sort: '', limit, offset });
        if (error) {
            console.log('1111');
            showDialog('', error.data.message);
        } else {
            const json = result.records
            setDetail(json);
            setPage(result.records.length)
            setLoading(false)
        }
    };



    const detailMemo = React.useMemo(() => detail.map((x) => ({ ...x })), [detail]);

    const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

    const handleClose = () => {
        setOpen(false)
    };


    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
        const rowData = detail.find(row => row.id === id);
        console.log('Row data being saved:', rowData);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };


    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

    }

    const checkValue = (name, plan, result) => {
        switch (true) {
            case name === 'Tổng nợ / Tổng tài sản' || name === 'Kỳ thu tiền bình quân' || objective_type === 'selling_expenses' || objective_type === 'budget_management':
                if (result < plan) return '#2F7D32';
                if (result > plan) return 'red';
                return '#f47623';
            default:
                if (result < plan) return 'red';
                if (result > plan) return '#2F7D32';
                return '#f47623';
        }
    };


    const columns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'name',
            headerName: getLabel('name'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='body2'>{params?.row?.name || ''}</Typography></Stack>
            },
            headerAlign: 'left',
            flex: 1
        },

        // {
        //     field: 'objective_type',
        //     headerName: getLabel('objective_type'),
        //     renderCell: (params) => {
        //         return <Stack height='100%' alignItems='flex-start' justifyContent='center'> <Typography variant='body2'>{params?.row?.objective_type || ''}</Typography></Stack>
        //     },
        //     headerAlign: 'left',
        //     flex: 0.5

        // },
        // {
        //     field: 'company_objective_id',
        //     headerName: getLabel('company_objective_id'),
        //     renderCell: (params) => params.row.company_objective_id[1],
        //     headerAlign: 'left',
        //     align: 'left',
        //     flex: 1


        // },
        {
            field: 'plan',
            headerName: getLabel('plan'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography
                    color={checkValue(params.row.name, params.row.plan, params.row.result)}
                    variant='body2'>{formatterRevenue.format(params?.row?.plan || 0)}</Typography></Stack>
            },
            flex: 0.2,
            headerAlign: 'center',
            align: 'center',
            editable: true
        },
        {
            field: 'result',
            headerName: getLabel('Result'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography
                    color={checkValue(params.row.name, params.row.plan, params.row.result)}
                    variant='body2'>{formatterRevenue.format(params?.row?.result || 0)}</Typography></Stack>
            },
            headerAlign: 'center',
            align: 'center',
            flex: 0.2
        },

        crud.write ? {
            field: 'department_ids',
            headerName: getLabel('department_ids'),
            renderCell: (params) => {
                return <Stack height='100%' justifyContent='center'> <Typography variant='body2'>{`${params?.row?.department_ids?.length || 0} phòng `}</Typography></Stack>
            },
            headerAlign: 'left',
            align: 'left',

        } : null,
        crud.write ? {
            field: 'unit',
            headerName: getLabel('unit'),
            renderCell: (params) => {
                return <Stack height='100%' alignItems='center' justifyContent='center'> <Typography variant='body2'>{params?.row?.unit || ''}</Typography></Stack>
            },

            headerAlign: 'center',
        } : null,
        crud.write ? {
            field: 'is_active',
            headerName: getLabel('is_active'),
            renderCell: (params) =>
                <Stack height='100%' justifyContent='center'>
                    <Checkbox sx={{ padding: 0 }} checked={params?.row?.is_active} />
                </Stack>,
            headerAlign: 'left',
            align: 'left',
        } : null,
        crud.write ? {
            field: 'actions',
            type: 'actions',
            headerName: '',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'green',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="error"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<BorderColorIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="primary"
                    />
                ];
            },
        } : null,

    ].filter((column) => column !== null)

    const handlePageChange = (events, page) => {
        setCurrentPage(page);
        if (page < 0 || page >= Math.ceil(page / 40)) {
            console.log('Trang không hợp lệ');
        }
        if (page === 1) {
            getDetailInfo(40, 0, objective_type.value)
        } else {
            const startIndex = (page * 40 - 40) + 1;
            getDetailInfo(40, startIndex, objective_type.value)
        }

    };


    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };

        if (newRow.plan !== undefined) {
            write('company.objective.line', [newRow.id], { plan: newRow.plan })
                .then((json) => {
                    if (json.error) {
                        showDialog('', json.error.data.message);
                    } else {
                        console.log('New plan value:', newRow.plan, newRow);
                        setDetail(detail.map((row) => (row.id === newRow.id ? updatedRow : row)));
                        showNotification('', 'Đã cập nhật plan', 'success')
                    }
                })
                .catch((error) => {
                    console.error('Error updating row:', error);
                });
        } else {
            setDetail(detail.map((row) => (row.id === newRow.id ? updatedRow : row)));
        }

        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };


    const handleRowClick = (id = '') => {
        navigate({ pathname: routes.DetailObjectiveLine.path, search: createSearchParams({ id }).toString() });
    };


    const handelChangeType = async (type) => {
        setLoading(true)
        await getDetailInfo(40, 0, type.value);
        setObjectiveType(type)
        setLoading(false)

    }

    const CustomToolbar = () => {
        // const page = line_ids.length
        return (
            <GridToolbarContainer>
                <Stack width='100%' direction='row' gap='8px' justifyContent='space-between' alignItems='center'>
                    <Stack direction='column' gap='8px'>
                        <Typography padding='0 4px' variant='h6' textTransform='uppercase'>Chi tiết</Typography>
                        <Stack direction='row' gap='8px' width='100%'>
                            <FormControl required fullWidth>
                                <Select required
                                    sx={{ backgroundColor: '#EBEFFF' }}
                                    variant={'outlined'}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    size="small"
                                    value={objective_type.value === 'control_index' ? 'Chỉ số kiểm soát' :
                                        objective_type.value === 'revenue' ? 'Doanh thu & lợi nhuận gộp' :
                                            objective_type.value === 'selling_expenses' ? 'Chi phí bán hàng' :
                                                objective_type.value === 'budget_management' ? 'Chi phí quản lý' : 'Chi phí quản lý - Tỉ lệ'

                                    }
                                    renderValue={(p) => p}
                                    onChange={({ target: { value: objective_type } }) => {
                                        handelChangeType(objective_type)
                                        // this.handelUpdateState(projectType)
                                    }}
                                >
                                    {listObjectiveType.map((option) => (
                                        <MenuItem key={option.value} value={option}>
                                            {option.text}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button onClick={() => { viewResult() }} color='success' variant='contained' sx={{ width: '180px' }}>Xem kết quả</Button>
                        </Stack>
                    </Stack>

                    <Pagination
                        onChange={handlePageChange}
                        page={currentPage}
                        count={Math.ceil(page / 40)} />
                </Stack>
            </GridToolbarContainer >
        );
    }


    const viewResult = async () => {
        const { beforeStartDate, beforeEndDate } = await getPreviousMonthRange(starting, ending)
        setLoading(true)
        if (objective_type.value === 'control_index') {
            const [current, before] = await Promise.all([
                getControlIndexFilter(branch?.value || false, business?.value || false, moment(starting).format(DATE_TIME_FORMAT), moment(ending).format(DATE_TIME_FORMAT)),
                getControlIndexFilter(branch?.value || false, business?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            console.log('result', result);
            setOpen(true)
            setLoading(false)
        }

        if (objective_type.value === 'revenue') {
            const [current, before] = await Promise.all([
                getRevenuesFilter(branch?.value || false, business?.value || false, moment(starting).format(DATE_TIME_FORMAT), moment(ending).format(DATE_TIME_FORMAT)),
                getRevenuesFilter(branch?.value || false, business?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),

            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            console.log('result', result);
            setOpen(true)
            setLoading(false)
        }

        if (objective_type.value === 'selling_expenses') {
            const [current, before] = await Promise.all([
                getSellingExpensessFilter(branch?.value || false, business?.value || false, moment(starting).format(DATE_TIME_FORMAT), moment(ending).format(DATE_TIME_FORMAT)),
                getSellingExpensessFilter(branch?.value || false, business?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT))
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            console.log('result', result);
            setOpen(true)
            setLoading(false)
        }

        if (objective_type.value === 'budget_management') {
            const [current, before] = await Promise.all([
                getManagementExpensesFilter(branch?.value || false, business?.value || false, moment(starting).format(DATE_TIME_FORMAT), moment(ending).format(DATE_TIME_FORMAT)),
                getManagementExpensesFilter(branch?.value || false, business?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            console.log('result', result);
            setOpen(true)
            setLoading(false)
        }

        if (objective_type.value === 'ratio_management') {
            const [current, before] = await Promise.all([
                getManagementExpensesFilter(branch?.value || false, business?.value || false, moment(starting).format(DATE_TIME_FORMAT), moment(ending).format(DATE_TIME_FORMAT)),
                getManagementExpensesFilter(branch?.value || false, business?.value || false, moment(beforeStartDate).format(DATE_TIME_FORMAT), moment(beforeEndDate).format(DATE_TIME_FORMAT)),
            ])
            const result = current.result.map(obj => {
                const beforeObj = before.result.find(item => item.code === obj.code);
                return {
                    ...obj,
                    before: beforeObj ? beforeObj.value : 0
                };
            });
            setData(result)
            console.log('result', result);
            setOpen(true)
            setLoading(false)
        }

    }

    const resultColumns = [
        // { field: 'id', headerName: '#', width: 90 },
        {
            field: 'name', headerName: 'Chi tiêu', flex: 1, align: 'left', headerAlign: 'left'
        },

        {
            field: 'code', headerName: 'Mã số', align: 'right', headerAlign: 'right',

        },

        {
            field: 'description',
            headerName: 'Thuyết minh',
            align: 'right', headerAlign: 'right',
            renderCell: (params) =>
                params?.row?.description || '',
        },

        {
            field: 'value',
            headerName: 'Số cuối kỳ',
            align: 'right', headerAlign: 'right',
            renderCell: (params) =>
                formatterRevenue.format(params?.row?.value || 0),
            flex: 0.2
        },



        {
            field: 'before', headerName: 'Số đầu kỳ', align: 'right', headerAlign: 'right',
            renderCell: (params) =>
                formatterRevenue.format(params?.row?.before || 0),
            flex: 0.2


        },

    ]

    const dataMemo = useMemo(() => data.map((x, index) => ({ id: index, ...x })), [data])



    useEffect(() => {
        getFieldsDetail();
        getDetailInfo(40, 0, objective_type.value);
    }, [id, line_ids]);

    return (
        <Box width='100%'  >
            <StripedDataGrid
                editMode="row"
                sx={{
                    [`& .${gridClasses.cell}`]: {
                        py: 1
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        textOverflow: "clip",
                        whiteSpace: "break-spaces",
                        lineHeight: 1
                    },
                    '& .MuiDataGrid-row': {
                    },
                    border: 0,
                }}
                className="data-grid grid-dashboard"
                rows={detailMemo}
                columns={columns}
                hideFooter
                loading={loading}
                getRowHeight={() => 'auto'}
                autoHeight {...detailMemo}
                localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                onRowEditStop={handleRowEditStop}
                rowModesModel={rowModesModel}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                initialState={{
                    ...detailMemo.initialState,
                    pagination: { paginationModel: { pageSize: 100 } },
                }}
                onRowDoubleClick={(row) => { handleRowClick(row.id); }}
                slots={{
                    toolbar: CustomToolbar,
                }}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                } />

            <Modal aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotprops={{
                    backdrop: {
                        timeout: 500,
                    },
                }}>
                <Fade in={open}>
                    <Box sx={styleResult}>
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
                            className="custom-dataGrid"
                            rows={dataMemo}
                            columns={resultColumns}
                            pageSize={10}
                            autoHeight {...dataMemo}
                            hideFooter
                            initialState={{
                                ...dataMemo.initialState,
                                pagination: { paginationModel: { pageSize: 100 } },
                            }}
                            localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
                            getRowClassName={(params) =>
                                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                            }
                        />
                    </Box>
                </Fade>
            </Modal>
        </Box >
    )
}

export default TabLines
