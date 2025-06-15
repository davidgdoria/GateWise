import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const EditPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: '',
    price: '',
    num_spaces: '',
    description: '',
    duration_days: '',
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/v1/plans/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const plan = response.data;
        setForm({
          name: plan.name || '',
          price: plan.price?.toString() || '',
          num_spaces: plan.num_spaces?.toString() || '',
          description: plan.description || '',
          duration_days: plan.duration_days?.toString() || '',
          active: !!plan.active,
        });
      } catch (err) {
        setError('Failed to fetch plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price || !form.num_spaces || !form.description || !form.duration_days) {
      setError('All fields are required.');
      return;
    }
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        return;
      }
      await axios.put(`${API_BASE_URL}/api/v1/plans/${id}`, {
        name: form.name,
        price: parseFloat(form.price),
        num_spaces: parseInt(form.num_spaces, 10),
        description: form.description,
        duration_days: parseInt(form.duration_days, 10),
        active: form.active ? 1 : 0,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/plans');
    } catch (err) {
      setError('Failed to update plan.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Edit Plan
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Price"
            name="price"
            value={form.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Num Spaces"
            name="num_spaces"
            value={form.num_spaces}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="number"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Duration (days)"
            name="duration_days"
            value={form.duration_days}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="number"
            inputProps={{ min: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.active}
                onChange={handleChange}
                name="active"
                color="primary"
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
          {error && <Typography color="error" mb={2}>{error}</Typography>}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/plans')}>Cancel</Button>
            <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
              Update Plan
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              type="number"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Num Spaces"
              name="num_spaces"
              value={form.num_spaces}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              type="number"
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Duration (days)"
              name="duration_days"
              value={form.duration_days}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              type="number"
              inputProps={{ min: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.active}
                  onChange={handleChange}
                  name="active"
                  color="primary"
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/plans')}>Cancel</Button>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Update Plan
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default EditPlan; 