import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';

const MUIComponents: React.FC = () => {
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        MUI Components Demo
      </Typography>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Basic Components
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Button variant="contained" color="primary">
            Primary Button
          </Button>
          <Button variant="outlined" color="secondary">
            Secondary Button
          </Button>
          <Button variant="text">Text Button</Button>
          <Chip label="Chip Component" color="primary" />
        </Box>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Card Component
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is a Material-UI Card component with Material Design 3 styling.
            It demonstrates the theme configuration and component integration.
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            Action 1
          </Button>
          <Button size="small" color="secondary">
            Action 2
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default MUIComponents;
