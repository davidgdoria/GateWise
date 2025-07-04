import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const EditParkingSpace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_allocated: false,
    is_occupied: false,
    type: 'regular'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If state is present, use it; otherwise fetch from API
    if (location.state && location.state.space) {
      setForm({
        name: location.state.space.name || '',
        description: location.state.space.description || '',
        is_allocated: !!location.state.space.is_allocated,
        is_occupied: !!location.state.space.is_occupied,
        type: location.state.space.type || 'regular'
      });
      setLoading(false);
    } else {
      const fetchSpace = async () => {
        setLoading(true);
        setError('');
        try {
          const token = Cookies.get('access_token');
          if (!token) {
            navigate('/login');
            return;
          }
          const res = await axios.get(`${API_BASE_URL}/api/v1/parking-spaces/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } });
          setForm({
            name: res.data.name || '',
            description: res.data.description || '',
            is_allocated: !!res.data.is_allocated,
            is_occupied: !!res.data.is_occupied,
            type: res.data.type || 'regular'
          });
        } catch (err) {
          setError('Failed to fetch parking space.');
        } finally {
          setLoading(false);
        }
      };
      fetchSpace();
    }
  }, [id, navigate, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setForm(prev => ({ ...prev, type: value as 'regular' | 'disabled' | 'pregnant' | 'ev' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.description) {
      setError('Name and description are required.');
      return;
    }
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.put(`${API_BASE_URL}/api/v1/parking-spaces/${id}`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/parking-spaces');
    } catch (err) {
      setError('Failed to update parking space.');
    }
  };

  if (loading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
    );
  }

  return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Edit Parking Space
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
            <FormControl sx={{ mt: 2, mb: 2 }} fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type"
                value={form.type}
                label="Type"
                onChange={handleSelectChange}
              >
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
                <MenuItem value="pregnant">Pregnant</MenuItem>
                <MenuItem value="ev">EV</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_allocated}
                  onChange={handleChange}
                  name="is_allocated"
                  color="primary"
                  
                />
              }
              label="Allocated"
              sx={{ mt: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_occupied}
                  onChange={handleChange}
                  name="is_occupied"
                  color="primary"
                  disabled
                />
              }
              label="Occupied"
              sx={{ mt: 2 }}
            />
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/parking-spaces')}>Cancel</Button>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Update Parking Space
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
  );
};

export default EditParkingSpace; 