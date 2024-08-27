import React, { useContext, useState } from 'react';

import PropTypes from 'prop-types';
import { NavLink as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// @mui
import { Box, Collapse, List, ListItemText, Menu, MenuItem, Popover } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

//
import { UserContext } from 'src/global';
import { StyledNavItem, StyledNavItemIcon } from './styles';


// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
  openNav: PropTypes.bool,
};

export default function NavSection({ data = [], openNav, ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem openNav={openNav} key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item, openNav, level = 0 }) {
  const { title, path, icon, info, subs = [] } = item;
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { showDialog } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  const handleClick = (event) => {
    if (subs.length > 0) {
      if (openNav) {
        setAnchorEl(event.currentTarget);
      } else {
        setOpen(!open);
      }
    } else {
      navigate(path);
    }
  };

  const renderSubItems = (subItems, subLevel) => (
    <List component="div" disablePadding>
      {subItems.map((subItem, index) => (
        <NavItem key={`${subLevel}-${index}`} item={subItem} openNav={openNav} level={subLevel} />
      ))}
    </List>
  );

  return (
    <>
      <StyledNavItem
        component={subs.length > 0 ? 'div' : RouterLink}
        to={subs.length > 0 ? undefined : path}
        onClick={handleClick}
        sx={{
          pl: 0 + level * 2,
          mt: 1,
          display: 'flex',
          justifyContent: openNav ? 'center' : 'flex-start',
          alignItems: 'center',
          '&.active': {
            color: 'text.primary',
            fontWeight: 'fontWeightBold',
          },
        }}
      >
        {level === 0 && <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>}

        {(!openNav || level > 0) && (
          <>
            <ListItemText disableTypography primary={title} />
            {info && info}
            {subs?.length > 0 && (open ? <ExpandLess /> : <ExpandMore />)}
          </>
        )}
      </StyledNavItem>

      {subs?.length > 0 && (
        openNav ? (
          <Menu
            id={`menu-${level}`}
            anchorEl={anchorEl}
            open={openPopover}
            onClose={handleClose}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            PaperProps={{
              style: {
                maxHeight: 48 * 6,
                width: '28ch',
                boxShadow: 'none',
              },
            }}
          >
            {renderSubItems(subs, level + 1)}
          </Menu>
        ) : (
          <Collapse in={open} timeout="auto" unmountOnExit>
            {renderSubItems(subs, level + 1)}
          </Collapse>
        )
      )}
    </>
  );
}