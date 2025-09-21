import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  Info as AboutIcon,
  Science as DemoIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';

interface NavigationProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 240;

const Navigation: React.FC<NavigationProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { isMobile } = useResponsive();

  const navigationItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/about', label: 'About', icon: <AboutIcon /> },
    { path: '/demo', label: 'Integration Demo', icon: <DemoIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar />
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

// Import Toolbar for the drawer content
import { Toolbar } from '@mui/material';

export default Navigation;
