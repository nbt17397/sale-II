import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Typography, Divider } from '@mui/material';
import Logo from 'src/components/logo/Logo';

// hooks
// import useResponsive from '../hooks/useResponsive';
// components
// import Logo from '../components/logo';
// import Iconify from '../components/iconify';
// sections
import { LoginForm } from '../sections/auth/login';




// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },

}));



const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  // const mdUp = useResponsive('up', 'md');

  return (
    <>
      <Helmet>
        <title> Đăng nhập | Đăng nhập hệ thống </title>
      </Helmet>

      <StyledRoot sx={{ backgroundImage: `url(${'/assets/images/covers/bg.png'})` }} >
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />



        <Container maxWidth="sm">

          <StyledContent>
            <Typography sx={{ textAlign: 'center' }} variant="h4" gutterBottom>
              Module Báo Cáo Quản Trị
            </Typography>



            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                HAO PHUONG CORP
              </Typography>
            </Divider>

            <LoginForm />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
