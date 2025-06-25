import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';
import { format, parseISO } from 'date-fns';

interface Payment {
  id: number;
  subscription_id: number;
  amount: number;
  paid_at: string;
  status: string;
  plan_name: string;
  user_full_name: string;
}

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const userType = Cookies.get('user_type');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/payments`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            page: page + 1,
            per_page: rowsPerPage
          }
        });

        setPayments(response.data.items || []);
        setTotalCount(response.data.total || 0);
      } catch (err) {
        setError('Failed to fetch payments.');
        console.error('Error fetching payments:', err);
      }
    };

    fetchPayments();
  }, [navigate, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
      <Box sx={{ p: 4, background: '#f7f7f7', minHeight: '100vh' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600}>
            Payments
          </Typography>
        </Box>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{payment.user_full_name || 'N/A'}</TableCell>
                    <TableCell>{payment.plan_name || 'N/A'}</TableCell>
                    <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{format(parseISO(payment.paid_at), 'dd/MM/yyyy HH:mm')}</TableCell>
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
          />
        </Paper>
      </Box>
  );
};

export default Payments; 