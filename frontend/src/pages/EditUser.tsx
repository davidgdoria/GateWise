import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from '@mui/material';
import { api } from '../services/api';
import Cookies from 'js-cookie';

interface User {
  id: number;
  full_name: string;
  email: string;
  type: string;
  is_active: boolean;
}

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user as User;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    type: '',
    is_active: true,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/users');
      return;
    }

    setFormData({
      full_name: user.full_name,
      email: user.email,
      type: user.type,
      is_active: user.is_active,
    });
  }, [user, navigate]);

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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = Cookies.get('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await api.put(`/users/${user.id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate('/users');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to update user. Please try again.');
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={4}>
        Edit User
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleTextChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleTextChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleSelectChange}
              label="Type"
              required
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="resident">Resident</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleSwitchChange}
                name="is_active"
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
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
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
              sx={{
                borderColor: '#222',
                color: '#222',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { 
                  borderColor: '#444',
                  background: 'rgba(34, 34, 34, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditUser; 