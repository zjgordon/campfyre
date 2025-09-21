import React from 'react';
import { Typography, Box } from '@mui/material';

const About: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        About Campfyre
      </Typography>
      <Typography variant="body1" paragraph>
        Campfyre is a collaborative development platform designed to bring teams
        together.
      </Typography>
      <Typography variant="body1" paragraph>
        We believe in the power of storytelling and collaboration to create
        amazing software.
      </Typography>
    </Box>
  );
};

export default About;
