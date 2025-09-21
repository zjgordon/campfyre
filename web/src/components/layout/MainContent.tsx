import React from 'react';
import { Box, Toolbar } from '@mui/material';

interface MainContentProps {
  children: React.ReactNode;
  drawerOpen: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ children, drawerOpen }) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${drawerOpen ? 240 : 0}px)` },
        ml: { sm: drawerOpen ? '240px' : 0 },
        transition: (theme) =>
          theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar />
      {children}
    </Box>
  );
};

export default MainContent;
