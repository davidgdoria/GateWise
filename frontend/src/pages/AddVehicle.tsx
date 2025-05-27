import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Paper } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const categories = ['Car', 'Motorcycle', 'Truck'];

const AddVehicle: React.FC = () => {
  const [license, setLicense] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Car');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!license.trim() || !desc.trim() || !category) {
      setError('All fields are required.');
      return;
    }
    // Here you would send the data to your backend or state management
    // For now, just navigate back to vehicles
    setError('');
    navigate('/vehicles');
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Add Vehicle
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="License Plate"
              value={license}
              onChange={e => setLicense(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={e => setCategory(e.target.value as string)}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/vehicles')}>Cancel</Button>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Add Vehicle
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AddVehicle; 