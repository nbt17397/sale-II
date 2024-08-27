import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { useMemo } from 'react';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader, Stack, Typography } from '@mui/material';
import { formatterRevenue } from 'src/global';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 550;
const LEGEND_HEIGHT = 180;

const StyledChartWrapper = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

AppCurrentVisits.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartColors: PropTypes.arrayOf(PropTypes.string),
  chartData: PropTypes.array,
};

export default function AppCurrentVisits({ title, subheader, chartColors, chartData, showTotal, ...other }) {
  console.log('chartData', chartData);
  const theme = useTheme();

  const chartLabels = chartData.map((i) => i.label);

  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = useChart({
    colors: chartColors,
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: 'center' },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: (seriesName) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: { donut: { labels: { show: false } } },
    },
  });

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  console.log('total', total);


  return (
    <Card sx={{ boxShadow: 'none' }} {...other}>
      <Stack direction='column' padding='16px' gap='16px'>
        {showTotal ? <Stack direction='column' width='30%' padding='16px' borderRadius='16px' sx={{ backgroundColor: '#FFC107' }}>
          <Typography variant='h6'>{formatterRevenue.format(total)} tỷ</Typography>
          <Typography variant='body1'>{showTotal}</Typography>
        </Stack> : null}
        <Stack width='100%' textAlign='center' padding='0 8px '>
          <Typography variant='h5'>{title}</Typography>
        </Stack>
      </Stack>

      <StyledChartWrapper dir="ltr" >
        <ReactApexChart type="pie" series={chartSeries} options={chartOptions} height={350} />
      </StyledChartWrapper>
    </Card>
  );
}
