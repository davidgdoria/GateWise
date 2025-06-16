import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Paper, SelectChangeEvent } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const vehicleTypes = ['Car', 'Motorcycle'];
const commonColors = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Other'
];

const AddVehicle: React.FC = () => {
  const [formData, setFormData] = useState({
    license_plate: '',
    make: '',
    model: '',
    color: '',
    type: 'Car'
  });
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (name === 'color' && value === 'Other') {
      setShowCustomColor(true);
      setFormData(prev => ({
        ...prev,
        color: ''
      }));
    } else if (name === 'color') {
      setShowCustomColor(false);
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.license_plate.trim()) {
      setError('License plate is required.');
      return;
    }

    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post('${API_BASE_URL}/vehicles', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      navigate('/vehicles');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Failed to add vehicle. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Add Vehicle
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="License Plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
              required
              error={!!error && !formData.license_plate.trim()}
              helperText={!formData.license_plate.trim() && error ? error : ''}
            />
            <TextField
              label="Make"
              name="make"
              value={formData.make}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
            />
            {showCustomColor ? (
              <TextField
                label="Custom Color"
                name="color"
                value={formData.color}
                onChange={handleTextChange}
                fullWidth
                margin="normal"
              />
            ) : (
              <FormControl fullWidth margin="normal">
                <InputLabel>Color</InputLabel>
                <Select
                  name="color"
                  value={formData.color}
                  label="Color"
                  onChange={handleSelectChange}
                >
                  {commonColors.map(color => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleSelectChange}
              >
                {vehicleTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/vehicles')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                sx={{ 
                  background: '#222', 
                  color: '#fff', 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  '&:hover': { background: '#444' } 
                }}
              >
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