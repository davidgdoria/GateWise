import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Checkbox, FormControlLabel } from '@mui/material';
// Layout import removed as it's no longer used.
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const AddPlan: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    num_spaces: '',
    description: '',
    duration_days: '',
    active: true,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      await axios.post(`${API_BASE_URL}/api/v1/plans/`, {
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
      setError('Failed to add plan.');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Add Plan
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
              Add Plan
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
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
                Add Plan
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AddPlan;