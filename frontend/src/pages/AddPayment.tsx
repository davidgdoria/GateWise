import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

interface User {
  id: number;
  full_name: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
}

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
}

interface SubscriptionWithDetails extends Subscription {
  user?: User;
  plan?: Plan;
}

const AddPayment: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch all active subscriptions
        const response = await axios.get(`${API_BASE_URL}/api/v1/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { 
            status: 'active'
          }
        });

        // Fetch plan details for each subscription
        const subscriptionsWithDetails = await Promise.all(
          (response.data.items || []).map(async (subscription: Subscription) => {
            const planResponse = await axios.get(`${API_BASE_URL}/api/v1/plans/${subscription.plan_id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            return {
              ...subscription,
              plan: planResponse.data
            };
          })
        );

        setSubscriptions(subscriptionsWithDetails);
      } catch (err) {
        setError('Failed to fetch subscriptions.');
        console.error('Error fetching data:', err);
      }
    };

    fetchSubscriptions();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const selectedSub = subscriptions.find(sub => sub.id === selectedSubscription);
      if (!selectedSub) {
        setError('Please select a subscription');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/v1/payments/`,
        {
          subscription_id: selectedSubscription,
          amount: selectedSub.plan?.price || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      navigate('/payments');
    } catch (err) {
      setError('Failed to create payment.');
      console.error('Error creating payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubscriptionData = subscriptions.find(sub => sub.id === selectedSubscription);

  return (
    <Layout>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Add Payment
        </Typography>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Subscription</InputLabel>
                  <Select
                    value={selectedSubscription || ''}
                    label="Subscription"
                    onChange={(e) => setSelectedSubscription(e.target.value as number)}
                    required
                  >
                    {subscriptions.map((subscription) => (
                      <MenuItem key={subscription.id} value={subscription.id}>
                        Subscription #{subscription.id} - {subscription.plan?.name || 'Unknown Plan'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Plan"
                  value={selectedSubscriptionData?.plan?.name || ''}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Amount"
                  value={selectedSubscriptionData?.plan?.price ? `€${selectedSubscriptionData.plan.price.toFixed(2)}` : ''}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/payments')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !selectedSubscription}
                  >
                    {loading ? 'Creating...' : 'Create Payment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AddPayment; 