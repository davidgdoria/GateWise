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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';
import AssignParkingSpaces from './AssignParkingSpaces';

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  num_spaces: number;
  duration_days: number;
}

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: string;
  cancellation_date: string | null;
  spaces_allocated: number;
  price_at_subscription: number;
  user: User;
  plan: Plan;
}

interface User {
  id: number;
  full_name: string;
}

interface Plan {
  id: number;
  name: string;
}

interface SubscriptionResponse {
  items: Subscription[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const decodeToken = (): any | null => {
  try {
    const token = Cookies.get('access_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

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
  const userPayload = decodeToken();
  const isAdmin = userPayload?.type === 'admin';
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);

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
        const subsRes = await axios.get(`${API_BASE_URL}/api/v1/subscriptions/`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { page, size: 10 }
        });
        setData(subsRes.data);
      } catch (err) {
        setError('Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [page, navigate]);

  

  const handleCancelClick = (sub: Subscription) => {
    setSubscriptionToDelete(sub);
    setDeleteDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToDelete) return;
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      await axios.patch(`${API_BASE_URL}/api/v1/subscriptions/${subscriptionToDelete.id}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setData({
        ...data,
        items: data.items.map(sub => 
          sub.id === subscriptionToDelete.id 
            ? { ...sub, status: 'inactive' }
            : sub
        )
      });
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    } catch (err) {
      alert('Failed to cancel subscription.');
    }
  };

  const handleCancelDialogClose = () => {
    setDeleteDialogOpen(false);
    setSubscriptionToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ maxWidth: '100%', ml: 0, mt: 0, pl: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Subscriptions
          </Typography>
          {isAdmin && (
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
          )}
        </Box>
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
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Spaces Allocated</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(data.items) && data.items.map((sub: Subscription) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.user?.full_name ?? sub.user_id}</TableCell>
                      <TableCell>{sub.plan?.name ?? sub.plan_id}</TableCell>
                      <TableCell>{sub.spaces_allocated}</TableCell>
                      <TableCell>
                        <Chip
                          label={sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          color={sub.status === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 700, fontSize: 15, px: 2 }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {sub.status === 'active' && (
                          <>
                            <IconButton 
                              size="small" 
                              sx={{ color: 'primary.main', mr: 1 }}
                              onClick={() => {
                                navigate('/assign-parking', { state: { subscription: sub, user: sub.user, plan: sub.plan } });
                              }}
                            >
                              <LocalParkingIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCancelClick(sub)} 
                              sx={{ color: 'warning.main' }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
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
      <Dialog open={deleteDialogOpen} onClose={handleCancelDialogClose}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this subscription? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="secondary">No, keep it</Button>
          <Button onClick={handleCancelConfirm} color="warning" variant="contained">Yes, cancel it</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subscriptions;