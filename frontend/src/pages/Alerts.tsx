import React from 'react';
import { Box, Typography } from '@mui/material';

const Alerts = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Alerts
      </Typography>
      <Typography variant="body1">
        System alerts and notifications coming soon...
      </Typography>
    </Box>
  );
};

export default Alerts; 