import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

interface ParkingSpaceForm {
  name: string;
  description: string;
  is_allocated: boolean;
  is_occupied: boolean;
  type: 'regular' | 'disabled' | 'pregnant' | 'ev';
}

const AddParkingSpace: React.FC = () => {
  const [form, setForm] = useState<ParkingSpaceForm>({
    name: '',
    description: '',
    is_allocated: false,
    is_occupied: false,
    type: 'regular'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name!]: value as ParkingSpaceForm['type'] }));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
      await axios.post(`${API_BASE_URL}/api/v1/parking-spaces`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/parking-spaces');
    } catch (err) {
      setError('Failed to add parking space.');
    }
  };

  return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Add Parking Space
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl sx={{ mt: 2, mb: 2 }}>
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
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_allocated}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  name="is_occupied"
                  color="primary"
                />
              }
              label="Occupied"
              sx={{ mt: 2 }}
            />
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/parking-spaces')}>Cancel</Button>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Add Parking Space
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
  );
};

export default AddParkingSpace; 