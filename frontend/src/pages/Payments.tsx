import React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/Layout';

const Payments: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 4, background: '#fff', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} mb={2}>
          Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is under construction. Please check back soon!
        </Typography>
      </Box>
    </Layout>
  );
};

export default Payments; 