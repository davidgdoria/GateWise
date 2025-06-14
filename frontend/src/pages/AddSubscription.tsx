import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Paper } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const statusOptions = ['Active', 'Expired'];

const AddSubscription: React.FC = () => {
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('Active');
  const [nextPayment, setNextPayment] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan.trim() || !status || !nextPayment || !amount.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post(`${API_BASE_URL}/api/v1/subscriptions/`, {
        plan,
        status,
        next_payment: nextPayment,
        amount: parseFloat(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/subscriptions');
    } catch (err) {
      setError('Failed to add subscription.');
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Add Subscription
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Plan Name"
              value={plan}
              onChange={e => setPlan(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={e => setStatus(e.target.value as string)}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Next Payment"
              type="date"
              value={nextPayment}
              onChange={e => setNextPayment(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              fullWidth
              margin="normal"
              required
              type="number"
              inputProps={{ min: 0 }}
            />
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/subscriptions')}>Cancel</Button>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Add Subscription
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AddSubscription; 