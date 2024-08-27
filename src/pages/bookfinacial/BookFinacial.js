import { useContext, useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Autocomplete, Box, Grid, Stack, TextField, Typography, alpha, styled, useMediaQuery } from '@mui/material'
import { createSearchParams, useNavigate } from 'react-router-dom';
import HeaderToolbar from 'src/layouts/dashboard/header/HeadToolbar';
import { DATE_FORMAT_TO_DISPLAY, DATE_TIME_FORMAT, DATE_TIME_FORMAT_TO_DISPLAY, UserContext, formatterRevenue, routes } from 'src/global';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { viVN } from '@mui/x-data-grid/locales';

import moment from 'moment';
import { DateTimePicker } from '@mui/x-date-pickers';

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


export default function BookFinacial() {
  const currentYear = new Date().getFullYear()
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate()
  const { loadViews, setLoading, searchRead, showDialog, nameSearch } = useContext(UserContext)
  const [fieldOfView, setFieldOfView] = useState({})
  const [purchaseReport, setPurchaseReport] = useState([])
  const [starting_date, setStartingDate] = useState(null || moment(`${currentYear}-01-01 00:00:00`))
  const [ending_date, setEndingDate] = useState(null || moment(`${currentYear}-12-31 00:00:00`))
  const [branch_id, setBranch_id] = useState({ text: 'Công ty Cổ Phần Hạo Phương', value: 1 })
  const [listBranch, setListBranch] = useState([])
  const getLabel = (fieldName) => (fieldOfView[fieldName] && fieldOfView[fieldName].string || fieldName);

  const fetchLoadViews = async () => {
    // setLoading(true)
    const viewPurchase = await loadViews('account.purchase.report', ['list']);
    if (viewPurchase.error) {
      setLoading(false)
      showDialog('', viewPurchase.error.data.message);
      return;
    }
    const result = viewPurchase.result.fields;

    setFieldOfView(result)
    // setLoading(false)
  }



  const onTextChangeBranch = async (value = '') => {
    const json = await nameSearch('res.company.modify', value)
    const result = json.result.map((option) => ({ value: option[0], text: option[1], label: option[1], }))
    setListBranch(result)
  }

  const getDataForEnDate = (date) => {
    if (!starting_date) {
      showDialog('', 'Vui lòng chọn đủ thông tin')
      return
    }
    setEndingDate(date)
    getData(moment(starting_date).format(DATE_TIME_FORMAT), moment(date).format(DATE_TIME_FORMAT))
  }

  const getData = async (starting_date, ending_date, branch_id) => {
    setLoading(true)

    const filters = [
      ["starting_date", ">=", starting_date || `${currentYear}-01-01 00:00:00`],
      ["ending_date", "<=", ending_date || `${currentYear}-12-31 00:00:00`],
    ];

    if (branch_id) {
      filters.push(['branch_id', '=', branch_id]);
    }


    const [data] = await Promise.all([
      searchRead('account.purchase.report', ["name", "starting_date", "ending_date", "branch_id", "total_price"], filters)]);
    if (data.error) {
      showDialog('', data.error.data.message);
      setLoading(false)
      return;
    }
    const result = data.result.records;
    setPurchaseReport(result);
    setLoading(false)
  };


  const getDataForBranch = (branch_id) => {
    console.log('branch_id', branch_id);
    if (!starting_date || !ending_date) {
      showDialog('', 'Vui lòng chọn thời gian')
      return
    }
    setBranch_id(branch_id || {})
    getData(moment(starting_date).format(DATE_TIME_FORMAT), moment(ending_date).format(DATE_TIME_FORMAT), branch_id.value)
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
      field: 'branch_id',
      headerName: getLabel('Công ty'),
      renderCell: (params) =>
        params?.row?.branch_id[1] || '',
      flex: 1
    },
    {
      field: 'total_price',
      headerName: getLabel('Tổng tiền'),
      renderCell: (params) =>
        formatterRevenue.format(params?.row?.total_price || 0),
      flex: 1
    },

    {
      field: 'starting_date',
      headerName: getLabel('Ngày bắt đầu'),
      type: 'datetime',
      renderCell: (params) => moment(params.row.starting_date).add(7, 'hours').format(DATE_FORMAT_TO_DISPLAY),
      flex: 0.3,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'ending_date',
      headerName: getLabel('Ngày kết thúc'),
      type: 'datetime',
      renderCell: (params) => moment(params.row.ending_date).add(7, 'hours').format(DATE_FORMAT_TO_DISPLAY),
      flex: 0.3,
      headerAlign: 'center',
      align: 'center'
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

  const handleRowClick = (id = '') => {
    navigate({ pathname: routes.DetailBookFinancial.path, search: createSearchParams({ id }).toString() });
  };

  const dataMemo = useMemo(() => purchaseReport.map((item, index) => ({ id: index, key: item.id, ...item })), [purchaseReport])

  console.log('dataMemo', dataMemo);

  useEffect(() => { getData(); onTextChangeBranch(); fetchLoadViews(); }, [])

  return (
    <>
      <Helmet>
        <title> Sổ chi tiết mua hàng </title>
      </Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', transform: 'translateZ(0px)', flexGrow: 1 }}>
        <HeaderToolbar routeName='Danh sách chi tiết mua hàng'
          buttons={
            [
              { text: 'Tạo', onClick: () => { navigate({ pathname: routes.DetailBookFinancial.path, search: createSearchParams({ id: '' }).toString() }) } }
            ]
          }

        />

        <Box sx={{ maxHeight: isMobile ? '100vh' : 'calc(100vh - 250px)', overflow: isMobile ? 'unset' : 'auto', backgroundColor: 'white', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          <Box padding='8px' backgroundColor='#F8F8F8' borderRadius='4px'>
            <Grid container spacing={3}  >
              <Grid item xs={12} md={3} sm={3} lg={3}>
                <Autocomplete
                  className='custom-autocomplete'
                  disablePortal
                  id="combo-box-demo"
                  value={branch_id?.text || ''}
                  // inputValue={this.state.managerSearch}
                  onChange={(event, branchId) => {
                    getDataForBranch(branchId)
                  }}
                  options={listBranch}
                  onInputChange={(event, newInputValue) => {
                    if (newInputValue === '') {
                      // Xử lý khi người dùng xóa giá trị
                      getDataForBranch(newInputValue)
                    }
                  }}
                  sx={{ width: '100%' }}
                  renderInput={(params) => (
                    <TextField variant={'outlined'}
                      {...params} />
                  )} />
              </Grid>
              <Grid sx={{ alignItems: 'center', display: 'flex', gap: '4px' }} item xs={12} md={4} sm={4} lg={4}>
                <DateTimePicker
                  className='custom-template'
                  size="small"
                  variant='standard'
                  format={DATE_TIME_FORMAT_TO_DISPLAY}
                  onChange={(date) => { setStartingDate(date) }}
                  value={starting_date}
                />
                <Typography variant='caption'>Đến</Typography>
                <DateTimePicker
                  className='custom-template'
                  size="small"
                  format={DATE_TIME_FORMAT_TO_DISPLAY}
                  onChange={(date) => { getDataForEnDate(date) }}
                  value={ending_date}
                />
              </Grid>
            </Grid>
          </Box>

          <StripedDataGrid
            className="custom-dataGrid"
            rows={dataMemo}
            columns={columns}
            pageSize={10}
            autoHeight {...dataMemo}
            initialState={{
              ...dataMemo.initialState,
              pagination: { paginationModel: { pageSize: 8 } },
            }}
            localeText={viVN.components.MuiDataGrid.defaultProps.localeText}
            onRowClick={(row) => {
              handleRowClick(row.id);
            }}
            rowsPerPageOptions={[5]}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
            }
          />
        </Box>
      </Box>
    </>
  );
}
