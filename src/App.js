import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
import './App.css';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
import { UserProvider } from './global';

// ----------------------------------------------------------------------

export default function App() {

  return (
    <ThemeProvider  >
      <UserProvider>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <ScrollToTop />
          <StyledChart />
          <Router />
        </LocalizationProvider >
      </UserProvider>
    </ThemeProvider>
  );
}
