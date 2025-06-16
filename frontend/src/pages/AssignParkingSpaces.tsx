import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import Layout from '../components/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

interface ParkingSpace {
  id: number;
  name: string;
  description: string;
  is_allocated: boolean;
  is_occupied: boolean;
}

interface AssignState {
  subscription: any;
  user: any;
  plan: any;
}

const AssignParkingSpaces: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription, user, plan } = (location.state || {}) as AssignState;
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<(number | '')[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSpaces = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // First, get the total count
        const countRes = await axios.get(`${API_BASE_URL}/parking-spaces`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { page: 1, size: 1 } // Just get the first item to get total count
        });

        const total = countRes.data.total;

        // Then fetch all spaces in one call
        const res = await axios.get(`${API_BASE_URL}/parking-spaces`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { page: 1, size: total } // Get all spaces
        });

        // Filter for unallocated spaces
        setSpaces((res.data.items || res.data).filter((s: ParkingSpace) => !s.is_allocated));
      } catch (err) {
        setError('Failed to fetch parking spaces.');
      }
    };
    fetchSpaces();
    if (subscription?.spaces_allocated) {
      setSelectedSpaces(Array(subscription.spaces_allocated).fill(''));
    }
  }, [navigate, subscription]);

  const handleSelect = (idx: number, value: number) => {
    setSelectedSpaces(prev => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  // Remove already selected spaces from other dropdowns
  const getAvailableSpaces = (idx: number) => {
    return spaces.filter(space =>
      !selectedSpaces.includes(space.id) || selectedSpaces[idx] === space.id
    );
  };

  if (!subscription || !user || !plan) {
    return <Layout><Box p={4}><Typography color="error">Missing subscription, user, or plan data.</Typography></Box></Layout>;
  }

  return (
    <Layout>
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Assign Parking Spaces
          </Typography>
          <TextField
            label="User"
            value={user.full_name || ''}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Plan"
            value={plan.name || ''}
            fullWidth
            margin="normal"
            disabled
          />
          {Array.from({ length: subscription.spaces_allocated }).map((_, idx) => (
            <FormControl fullWidth margin="normal" key={idx}>
              <InputLabel>{`Parking Space #${idx + 1}`}</InputLabel>
              <Select
                value={selectedSpaces[idx]}
                label={`Parking Space #${idx + 1}`}
                onChange={e => handleSelect(idx, e.target.value as number)}
              >
                {getAvailableSpaces(idx).map(space => (
                  <MenuItem key={space.id} value={space.id}>
                    {space.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          {error && <Typography color="error" mb={2}>{error}</Typography>}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/subscriptions')}>Cancel</Button>
            <Button variant="contained" disabled sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
              Assign (Coming Soon)
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default AssignParkingSpaces; 