import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface AppBarProps {
  onMenuClick: () => void;
  title?: string;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick, title = 'Campfyre' }) => {
  return (
    <MuiAppBar position="fixed" elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Future: User menu, notifications, etc. */}
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
