import { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

// @mui
import { styled } from '@mui/material/styles';
//
import Header from './header';
import Nav from './nav';
import { ThemeContext } from '../../global';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => {
  const { isDarkTheme } = useContext(ThemeContext);
  return (
    {
      backgroundColor: isDarkTheme ? '#F8F8FB' : '#000',
      flexGrow: 1,
      maxHeight: '100vh',
      width: '100%',
      paddingTop: APP_BAR_MOBILE + 24,
      paddingBottom: theme.spacing(10),
      [theme.breakpoints.up('lg')]: {
        paddingTop: APP_BAR_DESKTOP + 24,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
      // Sử dụng media query để thay đổi giá trị overflow khi độ rộng màn hình nhỏ hơn 600px (điện thoại)
      '@media (max-width: 600px)': {
        overflow: 'auto',
      },
    }
  );
});

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);

  return (
    <StyledRoot>
      <Header openNav={open} onOpenNav={() => setOpen(!open)} />
      <Nav openNav={open} onCloseNav={() => setOpen(!open)} />
      <Main>
        <Outlet />
      </Main>
    </StyledRoot>
  );
}


