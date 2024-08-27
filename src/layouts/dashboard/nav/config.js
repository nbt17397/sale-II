// component
import { Avatar } from '@mui/material';
// import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <Avatar src={`/assets/icons/navbar/${name}.png`} sx={{ width: '32px', height: '32px', borderRadius: 0 }} />;

const dataAngle = [
  {
    title: 'Dữ liệu gốc',
    path: 'book-financial',
    icon: icon('book_financial'),
    subs: [{
      title: 'sổ chi tiết mua hàng',
      path: 'book-financial',

    }, {
      title: 'Sổ chi tài khoản kế toán',
      path: 'accouting-financial',
      subs: [
        {
          title: 'Sổ chi tài khoản kế toán',
          path: 'accouting-financial',
        }, {
          title: 'Công thức',
          path: 'recipe',
        }, {
          title: 'Mục tiêu công ty',
          path: 'company-objective',
        }
      ]
    },


    ]
  },
];

const dataOther = [
  {
    title: 'Quản Trị',
    path: '',
    icon: icon('manager'),
    subs: [{
      title: 'Báo cáo',
      path: 'report',
      icon: icon('report'),
    },
    {
      title: 'Biểu đồ',
      path: 'chart',
      icon: icon('chart'),
      subs: [{
        title: 'Kinh doanh',
        path: 'chart-business',
      },
      {
        title: 'Chi phí',
        path: 'chart-expenses',
      },
      {
        title: 'Chi phí bán hàng',
        path: 'chart-selling-expenses',
      },
      {
        title: 'Chi phí quản lý',
        path: 'chart-management-expenses',
      },
      {
        title: 'Chỉ số kiểm soát',
        path: 'chart-control-index',
      }
      ]
    },
    ]
  },

  {
    title: 'Mua hàng',
    path: '',
    icon: icon('shopping'),
    subs: [{
      title: 'Báo cáo',
      path: 'selling',
      icon: icon('report'),
    },
    {
      title: 'Biểu đồ',
      path: 'chart-selling',
      icon: icon('shopping-chart'),
    },
    ]
  },

  // {
  //   title: 'Mục tiêu',
  //   path: 'company-objective',
  //   icon: icon('objective'),
  // },
]

export { dataAngle, dataOther };
