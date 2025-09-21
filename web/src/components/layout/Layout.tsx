import React, { useState } from 'react';
import { Box } from '@mui/material';
import AppBar from './AppBar';
import Navigation from './Navigation';
import MainContent from './MainContent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar onMenuClick={handleDrawerToggle} />
      <Navigation open={drawerOpen} onClose={handleDrawerClose} />
      <MainContent drawerOpen={drawerOpen}>{children}</MainContent>
    </Box>
  );
};

export default Layout;
