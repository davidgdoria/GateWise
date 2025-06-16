import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';
import { SelectChangeEvent } from '@mui/material/Select';

interface User {
  id: number;
  full_name: string;
  is_active?: boolean;
}

interface Plan {
  id: number;
  name: string;
  active?: number;
  num_spaces?: number;
  price?: number;
}

const AddSubscription: React.FC = () => {
  type FormState = {
    user_id: string;
    plan_id: string;
    status: string;
    start_date: string;
    end_date: string;
    spaces_allocated: string;
    price_at_subscription: string;
  };
  const [form, setForm] = useState<FormState>({
    user_id: '',
    plan_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    spaces_allocated: '',
    price_at_subscription: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) return;
        const [usersRes, plansRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/plans/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        setUsers((usersRes.data.items || usersRes.data).filter((u: User) => u.is_active !== false));
        setPlans((plansRes.data.items || plansRes.data).filter((p: Plan) => p.active === 1));
      } catch (err) {
        setError('Failed to fetch users or plans.');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: FormState) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name === 'plan_id') {
      const selectedPlan = plans.find((p: Plan) => p.id === parseInt(value, 10));
      setForm((prev: FormState) => ({
        ...prev,
        plan_id: value,
        spaces_allocated: selectedPlan?.num_spaces?.toString() || '',
        price_at_subscription: selectedPlan?.price?.toString() || '',
      }));
    } else {
      setForm((prev: FormState) => ({ ...prev, [name as string]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.user_id || !form.plan_id || !form.status) {
      setError('User, plan, and status are required.');
      return;
    }
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        return;
      }
      await axios.post(`${API_BASE_URL}/subscriptions/`, {
        user_id: parseInt(form.user_id, 10),
        plan_id: parseInt(form.plan_id, 10),
        status: form.status,
        start_date: form.start_date,
        end_date: form.end_date,
        spaces_allocated: form.spaces_allocated ? parseInt(form.spaces_allocated, 10) : undefined,
        price_at_subscription: form.price_at_subscription ? parseFloat(form.price_at_subscription) : undefined,
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
            <FormControl fullWidth margin="normal" required>
              <InputLabel>User</InputLabel>
              <Select
                name="user_id"
                value={form.user_id}
                label="User"
                onChange={handleSelectChange}
              >
                {users.map((user: User) => (
                  <MenuItem key={user.id} value={user.id}>{user.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Plan</InputLabel>
              <Select
                name="plan_id"
                value={form.plan_id}
                label="Plan"
                onChange={handleSelectChange}
              >
                {plans.map((plan: Plan) => (
                  <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                label="Status"
                onChange={handleSelectChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Spaces Allocated"
              name="spaces_allocated"
              value={form.spaces_allocated}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 1 }}
              disabled
            />
            <TextField
              label="Price at Subscription"
              name="price_at_subscription"
              value={form.price_at_subscription}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
              disabled
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