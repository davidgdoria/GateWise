import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Paper, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import Cookies from 'js-cookie';

const userTypes = ['admin', 'user'];

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    type: ''
  });
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim() || !formData.type) {
      setError('All fields are required.');
      return;
    }

    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      await apiClient.createUser(formData);
      navigate('/users');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to add user. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Error adding user:', error);
    }
  };

  return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Add User
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
              required
              error={!!error && !formData.username.trim()}
              helperText={!formData.username.trim() && error ? error : ''}
            />
            <TextField
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
              required
              error={!!error && !formData.full_name.trim()}
              helperText={!formData.full_name.trim() && error ? error : ''}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              fullWidth
              margin="normal"
              required
              error={!!error && !formData.email.trim()}
              helperText={!formData.email.trim() && error ? error : ''}
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
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
                Add User
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
  );
};

export default AddUser; 