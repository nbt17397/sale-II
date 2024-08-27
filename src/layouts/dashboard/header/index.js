// import { useContext } from 'react';
import PropTypes from 'prop-types';
// import { useContext } from 'react';
// import { ThemeContext, UserContext } from 'src/global';
// import DarkModeIcon from '@mui/icons-material/DarkMode';
// import WbSunnyIcon from '@mui/icons-material/WbSunny';
// import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton } from '@mui/material';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// components
import Iconify from '../../../components/iconify';
//
import AccountPopover from './AccountPopover';
// import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';



// ----------------------------------------------------------------------

const NAV_WIDTH = 240;

const NAV_WIDTH_RESPONSEIVE = 80;


const HEADER_MOBILE = 64;

const HEADER_DESKTOP = 92;



const StyledRoot = styled(AppBar)(({ theme, openNav }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  boxShadow: 'none',
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${openNav ? NAV_WIDTH_RESPONSEIVE + 1 : NAV_WIDTH + 1}px)`,
  },
}));


const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

Header.propTypes = {
  onOpenNav: PropTypes.func,
  openNav: PropTypes.bool,
};



export default function Header({ onOpenNav, openNav }) {
  // const { isDarkTheme, switchAppTheme } = useContext(ThemeContext)
  // const { language } = useContext(UserContext)

  return (
    <StyledRoot openNav={openNav}>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            display: { lg: 'flex' },
          }}
        >
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1,
          }}
        >

          {/* <Tooltip title={isDarkTheme ? language.switchToLightTheme : language.switchToDarkTheme}>
            <IconButton onClick={switchAppTheme} sx={{ width: 40, height: 40 }}>
              {isDarkTheme ? <WbSunnyIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip> */}

          {/* hiện thông báo và ngôn ngữ */}
          {/* <LanguagePopover /> */}

          {/* <NotificationsPopover /> */}

          <AccountPopover />
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}
