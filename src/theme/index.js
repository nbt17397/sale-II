import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
//
import { ThemeContext } from 'src/global';
// import palette from './palette';
import shadows from './shadows';
import typography from './typography';
import GlobalStyles from './globalStyles';
import customShadows from './customShadows';
import componentsOverride from './overrides';


// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};



export default function ThemeProvider({ children }) {

  const [appTheme, setAppTheme] = useState('light')
  const isDarkTheme = appTheme === 'light'
  const switchAppTheme = () => { if (isDarkTheme) setAppTheme('light'); else setAppTheme('light') }
  const themeContextDefault = { appTheme, setAppTheme, isDarkTheme, switchAppTheme }

  const themeOptions = useMemo(
    () => ({
      palette: { mode: appTheme },
      shape: { borderRadius: 6 },
      typography,
      shadows: shadows(),
      customShadows: customShadows(),
    }),
    [appTheme]
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);


  return (
    <ThemeContext.Provider value={themeContextDefault}>

      <StyledEngineProvider injectFirst>
        <MUIThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles />
          {children}
        </MUIThemeProvider>
      </StyledEngineProvider>

    </ThemeContext.Provider>

  );
}
