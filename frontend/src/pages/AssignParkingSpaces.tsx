import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
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
  const userType = Cookies.get('user_type');

  useEffect(() => {
    const fetchSpaces = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }
        // Fetch unallocated spaces for dropdown options
        const res = await axios.get(`${API_BASE_URL}/api/v1/parking-spaces`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { is_allocated: false }
        });
        setSpaces(res.data.items || res.data);
      } catch (err) {
        setError('Failed to fetch parking spaces.');
      }
    };

    const fetchAssignedSpaces = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }
        // Fetch spaces already allocated to this subscription
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/subscriptions/${subscription.id}/parking-spaces`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        // Get the assigned spaces and add them to the spaces list
        const assignedSpaces = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setSpaces(prevSpaces => [...prevSpaces, ...assignedSpaces]);
        
        // Pre-fill the dropdowns with assigned spaces
        if (subscription?.spaces_allocated) {
          const assignedIds = assignedSpaces.map((space: any) => space.id);
          setSelectedSpaces([
            ...assignedIds,
            ...Array(Math.max(0, subscription.spaces_allocated - assignedIds.length)).fill('')
          ]);
        }
      } catch (err) {
        setError('Failed to fetch assigned parking spaces.');
      }
    };

    fetchSpaces();
    if (subscription?.id && subscription?.spaces_allocated) {
      fetchAssignedSpaces();
    } else if (subscription?.spaces_allocated) {
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

  const handleAllocateSpaces = async () => {
    setError('');
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      // Allocate spaces to subscription
      await axios.post(
        `${API_BASE_URL}/api/v1/subscriptions/${subscription.id}/allocate_spaces`,
        { parking_space_ids: selectedSpaces.filter(id => id) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Update each parking space to set is_allocated: true
      await Promise.all(
        selectedSpaces.filter(id => id).map(id =>
          axios.put(
            `${API_BASE_URL}/api/v1/parking-spaces/${id}`,
            { is_allocated: true },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        )
      );
      navigate('/subscriptions');
    } catch (err) {
      setError('Failed to allocate parking spaces.');
    }
  };

  if (!subscription || !user || !plan) {
    return <Box p={4}><Typography color="error">Missing subscription, user, or plan data.</Typography></Box>;
  }

  return (
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
                disabled={userType === 'user'}
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
            <Button variant="outlined" color="secondary" onClick={() => navigate('/subscriptions')}>
              {userType === 'user' ? 'Back' : 'Cancel'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/parking-lot-layout', {
                state: { subscription, user, plan }
              })}
            >
              View Parking Layout
            </Button>
            {userType === 'admin' && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAllocateSpaces}
                disabled={selectedSpaces.filter(id => id).length === 0}
                sx={{ mt: 3 }}
              >
                Assign Spaces
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
  );
};

export default AssignParkingSpaces; 