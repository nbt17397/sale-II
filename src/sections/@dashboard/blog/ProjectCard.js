import React, { useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';


import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Card, Grid, Typography, CardContent, CardActionArea, CircularProgress, Popper, } from '@mui/material';
// import { routes } from 'src/global';
// utils
import { fDate } from '../../../utils/formatTime';
import { fNumber } from '../../../utils/formatNumber';
//
import SvgColor from '../../../components/svg-color';
import Iconify from '../../../components/iconify';


// ----------------------------------------------------------------------

const StyledCardMedia = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)',
});

const StyledTitle = styled(Link)({
  height: 44,
  overflow: 'hidden',
  WebkitLineClamp: 2,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
});

const StyledProgress = styled('div')(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: 'absolute',
  left: theme.spacing(3),
  bottom: theme.spacing(-2),
}));

const StyledInfo = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  color: theme.palette.text.disabled,
}));

const StyledCover = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

ProjectCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
};


// ----------------------------------------------------------------------
function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" sx={{ color: "#01AB55" }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};






export default function ProjectCard({ post, index }) {
  const { cover, title, member, state, category, task, createdAt } = post;
  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;
  const [progress, setProgress] = React.useState(10);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const POST_INFO = [
    { number: member, icon: 'mdi:user-group' },
    { number: state, icon: 'pajamas:stage-all' },
    { number: category, icon: 'material-symbols:category-rounded' },
    { number: task, icon: 'material-symbols:task-outline' },
  ];

  const handleOpen = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };


  const handlClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);


  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);


  const popperMemo = useMemo(() => {
    const styled = {
      textAlign: "center",
      marginBottom: 1
    }

    const styledIcon = {
      justifyContent: "flex-start",
      width: "10px",
      height: "10px",
      borderRadius: 50,
      margin: "auto 0",
    }

    const styledText = {
      justifyContent: "flex-end",
      fontSize: "14px"
    }

    return (
      <Box className='project-popper' sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, maxWidth: 350, display: "flex" }}>
        <Box sx={{ flexDirection: "column", }}>
          <Box sx={styled}>
            Tên dự án: {title}
          </Box>
          <Box sx={{ display: "flex", gap: 1, margin: 0.5 }}>
            <Typography className='blue' component={'span'} sx={styledIcon} />
            <Typography sx={styledText}>Giai đoạn hoàn thành: {progress} %</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, margin: 0.5 }}>
            <Typography className='mint' component={'span'} sx={styledIcon} />
            <Typography sx={styledText}>Hạng mục hoàn thành: {progress} %</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, margin: 0.5 }}>
            <Typography className='organe' component={'span'} sx={styledIcon} />
            <Typography sx={styledText}>Công việc hoàn thành: {progress} %</Typography>
          </Box>
        </Box>
      </Box>
    )
  }, [title, progress])

  // const navigate = useNavigate()

  return (
    <Grid item xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
      <Card
        onClick={() => { }}
        onMouseEnter={handleOpen}
        onMouseLeave={handlClose}
        sx={{ position: 'relative', cursor: "pointer" }}>
        <CardActionArea sx={{ zIndex: "10" }}>
          <StyledCardMedia
            sx={{
              ...((latestPostLarge || latestPost) && {
                pt: 'calc(100% * 4 / 3)',
                '&:after': {
                  top: 0,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  bgcolor: "rgb(22, 28, 36, 0.5)",
                },
              }),
              ...(latestPostLarge && {
                pt: {
                  xs: 'calc(100% * 4 / 3)',
                  sm: 'calc(100% * 3 / 4.66)',
                },
              }),
            }}
          >
            <SvgColor
              color="paper"
              src="/assets/icons/shape-avatar.svg"
              sx={{
                width: 90,
                height: 36,
                zIndex: 9,
                bottom: -15,
                position: 'absolute',
                color: 'background.paper',
                ...((latestPostLarge || latestPost) && { display: 'none' }),
              }}
            />
            <StyledProgress
              sx={{
                ...((latestPostLarge || latestPost) && {
                  zIndex: 9,
                  top: 24,
                  left: 24,
                  width: 40,
                  height: 40,
                }),
              }}
            >
              <CircularProgressWithLabel value={progress} />
            </StyledProgress>
            <StyledCover alt={title} src={cover} />
          </StyledCardMedia>

          <CardContent
            sx={{
              pt: 4,
              ...((latestPostLarge || latestPost) && {
                bottom: 0,
                width: '100%',
                position: 'absolute',
              }),
            }}
          >
            <Typography gutterBottom variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
              {fDate(createdAt)}
            </Typography>

            <StyledTitle
              color="inherit"
              variant="subtitle2"
              underline="hover"
              sx={{
                ...(latestPostLarge && { typography: 'h5', height: 60 }),
                ...((latestPostLarge || latestPost) && {
                  color: 'common.white',
                }),
              }}
            >
              {title}
            </StyledTitle>

            <StyledInfo>
              {POST_INFO.map((info, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: index === 0 ? 0 : 1.5,
                    ...((latestPostLarge || latestPost) && {
                      color: 'grey.500',
                    }),
                  }}
                >
                  <Iconify icon={info.icon} sx={{ width: 16, height: 16, mr: 0.5 }} />
                  <Typography variant="caption">{fNumber(info.number)}</Typography>
                </Box>
              ))}
            </StyledInfo>
          </CardContent>
        </CardActionArea>
      </Card>
      <Popper open={open} anchorEl={anchorEl} >
        {popperMemo}
      </Popper>
    </Grid >
  );
}
