import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const statusColor = (status: string) => {
  if (status === 'active') return { label: 'Active', color: 'success', sx: { background: '#4caf50', color: '#fff', fontWeight: 700 } };
  if (status === 'expired') return { label: 'Expired', color: 'error', sx: { background: '#ef5350', color: '#fff', fontWeight: 700 } };
  return { label: status, color: 'default', sx: {} };
};

interface Subscription {
  id: number;
  user_id: number;
  vehicle_id: number;
  type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionResponse {
  items: Subscription[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const Subscriptions: React.FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SubscriptionResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/v1/subscriptions/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            page: page,
            size: 10
          }
        });
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [page, navigate]);

  return (
    <Layout>
      <Box sx={{ maxWidth: '100%', ml: 0, mt: 0, pl: 0 }}>
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
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" mb={2}>{error}</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.id}</TableCell>
                      <TableCell>{sub.type}</TableCell>
                      <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={sub.is_active ? 'Active' : 'Expired'}
                          sx={{ ...statusColor(sub.is_active ? 'active' : 'expired').sx, borderRadius: 1, fontWeight: 700, fontSize: 15, px: 2 }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" sx={{ color: '#222' }}><MoreVertIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={data.pages}
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