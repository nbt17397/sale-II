import PropTypes from 'prop-types';
import { useContext, useEffect, useState, } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getImgUser, UserContext } from 'src/global';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar } from '@mui/material';

// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import { dataAngle, dataOther } from './config';


// ----------------------------------------------------------------------


const NAV_WIDTH = 240;
const NAV_WIDTH_RESPONSEIVE = 80;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));


// ----------------------------------------------------------------------

Nav.propTypes = {
  opennav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const isDesktop = useResponsive('up', 'lg');
  const { getSessionInfo, user, timer, setTimer, psms, accessRights } = useContext(UserContext)
  const [navConfig, setNavConfig] = useState([])
  const navigate = useNavigate();


  const getSession = async () => {
    if (!timer) {
      // Người dùng chưa đăng nhập hoặc đã hết thời gian hiệu lực
      // Chuyển hướng đến trang đăng nhập
      navigate('/login', { replace: true });
    }
    else {
      const currentTime = new Date().getTime();
      const loginTimeDifference = currentTime - timer;
      const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;
      await getSessionInfo()
      if (loginTimeDifference >= eightHoursInMilliseconds) {
        // Đã hết 8 giờ kể từ lần đăng nhập cuối cùng
        // Xóa thời gian đăng nhập cuối cùng và chuyển hướng người dùng đến trang đăng nhập
        localStorage.removeItem('lastLoginTime');
        setTimer(null);
        navigate('/login', { replace: true });
      }
    }
  }
  const getMenu = async () => {
    const access = await accessRights()
    const permissions = await psms.filter((key) => Object.prototype.hasOwnProperty.call(access.result, key))
      .map((key) => ({
        name: key,
        ...access.result[key]
      }));
    const ledger = await permissions.filter(x => x.name === 'account.general.ledger')
    const modify = await permissions.filter(x => x.name === 'account.account.modify')
    console.log('dataAngle', ledger[0].read);

    if (ledger[0].read) {
      setNavConfig([...dataAngle])
    }
    if (modify[0].read) {
      setNavConfig((prevNavConfig) => [...prevNavConfig, ...dataOther]);
    }

  }
  useEffect(() => {
    getSession()
    getMenu()
    // eslint-disable-next-line
  }, [])

  useEffect(() => { console.log(navConfig, 'aaaaaa'); }, [navConfig])





  useEffect(() => {
    if (openNav) {
      // onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: openNav ? 0 : 2.5, py: 3, display: 'inline-flex' }}>
        <Logo sx={{ width: '100%' }} openNav={openNav} />
      </Box>

      {openNav || <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Avatar src={getImgUser(user.uid)} alt="photoURL" />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {user.name}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {user.is_admin ? 'Admin' : 'Staff'}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>}


      <NavSection openNav={openNav} data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />

    </Scrollbar>
  );


  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: openNav ? NAV_WIDTH_RESPONSEIVE : NAV_WIDTH },
        transition: "width 0.05s ease-in",
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: openNav ? NAV_WIDTH_RESPONSEIVE : NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: openNav ? NAV_WIDTH_RESPONSEIVE : NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
