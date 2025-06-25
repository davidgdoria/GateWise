import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Paper, SelectChangeEvent } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, userApi } from '../services/api';
import Cookies from 'js-cookie';

const userTypes = ['admin', 'user'];

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  type: string;
}

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    id: 0,
    username: '',
    full_name: '',
    email: '',
    type: 'user'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.user) {
      setFormData(location.state.user);
    }
    setLoading(false);
  }, [location.state]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }

    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      await apiClient.updateUser(formData.id, formData);
      navigate('/users');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to update user. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Error updating user:', error);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      await userApi.sendPasswordResetEmail(formData.id);
      setError('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to send password reset email.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
    );
  }

  return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Edit User
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
              required
              disabled
              sx={{ 
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#666',
                },
                '& .MuiInputLabel-root.Mui-disabled': {
                  color: '#666',
                }
              }}
            />
            <TextField
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleSelectChange}
              >
                {userTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSendResetEmail}
                sx={{ mr: 2 }}
              >
                Send Password Reset Email
              </Button>
            </Box>
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/users')}
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
                Update User
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
  );
};

export default EditUser; 