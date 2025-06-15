import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Paper, SelectChangeEvent } from '@mui/material';
// Layout import removed as it's no longer used.
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { apiClient } from '../services/api';
import { AxiosError } from 'axios';

const vehicleTypes = ['car', 'motorcycle'];
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

interface Vehicle {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  color: string;
  type: string;
  owner_id: number;
  owner: {
    id: number;
    email: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const vehicle = location.state?.vehicle as Vehicle;
  const [formData, setFormData] = useState({
    license_plate: '',
    make: '',
    model: '',
    color: '',
    type: 'car'
  });
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (vehicle) {
      setFormData({
        license_plate: vehicle.license_plate,
        make: vehicle.make || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        type: vehicle.type?.toLowerCase() || 'car'
      });

      // Check if the color is not in the common colors list
      if (!commonColors.includes(vehicle.color)) {
        setShowCustomColor(true);
      }

      setLoading(false);
    } else {
      // If no vehicle data in state, redirect back to vehicles list
      navigate('/vehicles');
    }
  }, [vehicle, navigate]);

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

      await apiClient.put(`/vehicles/${id}/`, formData);
      navigate('/vehicles');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to update vehicle. Please try again.');
      }
      console.error('Error updating vehicle:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography>Loading...</Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Edit Vehicle
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
                    {type.charAt(0).toUpperCase() + type.slice(1)}
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
                Update Vehicle
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default EditVehicle; 