import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Pagination,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const subscriptionRows = [
  { plan: 'Premium', status: 'Active', next: '09/12/2027', amount: '$300' },
  { plan: 'Basic', status: 'Expired', next: '', amount: '$199' },
];

const statusColor = (status: string) => {
  if (status === 'Active') return { label: 'Active', color: 'success', sx: { background: '#4caf50', color: '#fff', fontWeight: 700 } };
  if (status === 'Expired') return { label: 'Expired', color: 'error', sx: { background: '#ef5350', color: '#fff', fontWeight: 700 } };
  return { label: status, color: 'default', sx: {} };
};

const Subscriptions: React.FC = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Subscriptions
        </Typography>
        <Box
          sx={{
            background: '#fff',
            borderRadius: 4,
            p: 3,
            boxShadow: 0,
            mb: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: '#222',
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { background: '#444' },
              }}
              onClick={() => navigate('/subscriptions/add')}
            >
              New subscription
            </Button>
            <Box display="flex" gap={2}>
              <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
                Export data
              </Button>
              <FormControl size="small">
                <Select defaultValue="id" sx={{ borderRadius: 2, fontWeight: 500 }}>
                  <MenuItem value="id">Sort by: ID</MenuItem>
                  <MenuItem value="plan">Sort by: Plan</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Next Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptionRows.map((row, idx) => (
                  <TableRow key={row.plan}>
                    <TableCell>{row.plan}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusColor(row.status).label}
                        sx={{ ...statusColor(row.status).sx, borderRadius: 1, fontWeight: 700, fontSize: 15, px: 2 }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{row.next}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" sx={{ color: '#222' }}><MoreVertIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={20}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              sx={{
                '& .Mui-selected': {
                  background: '#222',
                  color: '#fff',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default Subscriptions; 