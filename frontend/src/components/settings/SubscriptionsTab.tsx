import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TablePagination,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../../config';

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: string;
  spaces_allocated: number;
  price_at_subscription: number;
  user_full_name?: string;
  plan_name?: string;
}

const SubscriptionsTab: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            page: page + 1,
            per_page: rowsPerPage
          }
        });

        setSubscriptions(response.data.items || []);
        setTotalCount(response.data.total || 0);
      } catch (err) {
        setError('Failed to fetch subscriptions.');
        console.error('Error fetching subscriptions:', err);
      }
    };

    fetchSubscriptions();
  }, [navigate, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Subscriptions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/subscriptions/add')}
          sx={{
            background: '#222',
            color: '#fff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: '#444' },
          }}
        >
          Add Subscription
        </Button>
      </Box>
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 'none', 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          '& .MuiTableHead-root': {
            backgroundColor: '#f5f5f5',
            '& .MuiTableCell-root': {
              borderBottom: '2px solid #e0e0e0',
              fontWeight: 600,
              color: '#333',
              padding: '16px',
            },
          },
          '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '& .MuiTableCell-root': {
                borderBottom: '1px solid #e0e0e0',
                padding: '16px',
                color: '#333',
              },
            },
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Spaces</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.user_full_name || 'N/A'}</TableCell>
                <TableCell>{subscription.plan_name || 'N/A'}</TableCell>
                <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(subscription.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{subscription.spaces_allocated}</TableCell>
                <TableCell>€{subscription.price_at_subscription.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={subscription.status}
                    color={subscription.status === 'active' ? 'success' : 'default'}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      '&.MuiChip-root': {
                        height: '24px',
                        borderRadius: '12px',
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/subscriptions/edit/${subscription.id}`)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ 
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
        sx={{
          '.MuiTablePagination-select': {
            display: 'none',
          },
          '.MuiTablePagination-selectLabel': {
            display: 'none',
          },
          '.MuiTablePagination-displayedRows': {
            margin: 0,
          },
        }}
      />
    </Box>
  );
};

export default SubscriptionsTab; 