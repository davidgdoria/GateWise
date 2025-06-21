import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

interface PaymentDetails {
  payment_id: number;
  subscription_id: number;
  amount: number;
  plan_name: string;
  user_full_name: string;
  status: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  type: string;
}

const PaymentLink: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const paymentId = searchParams.get('paymentID');

  useEffect(() => {
    const validateAndFetchData = async () => {
      setError('');
      setLoading(true);

      try {
        if (!paymentId) {
          setError('Invalid payment link. Missing payment ID.');
          setLoading(false);
          return;
        }

        const currentToken = Cookies.get('access_token');
        if (!currentToken) {
          localStorage.setItem('paymentRedirectUrl', window.location.href);
          navigate('/login');
          return;
        }

        // Fetch user details
        const userResponse = await axios.get(`${API_BASE_URL}/api/v1/me`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        setUser(userResponse.data);

        // Validate the payment and check user authorization
        const response = await axios.get(`${API_BASE_URL}/api/v1/payments/?id=${paymentId}`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.data.items && response.data.items.length > 0) {
          const payment = response.data.items[0];
          setPaymentDetails({
            payment_id: payment.id,
            subscription_id: payment.subscription_id,
            amount: payment.amount,
            plan_name: payment.plan_name,
            user_full_name: payment.user_full_name,
            status: payment.status
          });
          
          // Check if payment is already completed
          if (payment.status === 'paid') {
            setError('This payment has already been completed.');
          }
        } else {
          setError('Payment not found. Please check your link and try again.');
        }

      } catch (err: any) {
        console.error('Error validating payment:', err);
        if (err.response?.status === 401) {
          localStorage.setItem('paymentRedirectUrl', window.location.href);
          navigate('/login');
          return;
        }
        if (err.response?.status === 403) {
          setError('You are not authorized to make this payment.');
        } else if (err.response?.status === 404) {
          setError('Payment not found. Please check your link and try again.');
        } else if (err.response?.status === 400) {
          setError('Payment has already been completed.');
        } else {
          setError('Failed to load payment details. Please check your link and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    validateAndFetchData();
  }, [paymentId, navigate]);

  const handlePayment = async () => {
    if (!paymentDetails) return;

    setProcessing(true);
    setError('');

    try {
      const currentToken = Cookies.get('access_token');
      if (!currentToken) {
        navigate('/login');
        return;
      }

      // Complete the payment
      await axios.post(
        `${API_BASE_URL}/api/v1/payments/${paymentDetails.payment_id}/mark_as_paid`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      localStorage.removeItem('paymentRedirectUrl');
      alert('Payment completed successfully!');
      navigate('/payments');
    } catch (err: any) {
      console.error('Error completing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('paymentRedirectUrl');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" gutterBottom align="center">
            Complete Payment
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }} align="center">
            Please review the payment details below and click "Complete Payment" to proceed.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="User Name"
              value={user?.full_name || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Payment ID"
              value={paymentDetails?.payment_id || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Subscription ID"
              value={paymentDetails?.subscription_id || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Plan"
              value={paymentDetails?.plan_name || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Amount"
              value={paymentDetails?.amount ? `€${paymentDetails.amount.toFixed(2)}` : ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Status"
              value={paymentDetails?.status || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
          </Box>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePayment}
              disabled={processing || !paymentDetails || paymentDetails.status === 'paid'}
            >
              {processing ? 'Processing...' : 'Complete Payment'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentLink; 