import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';
import Layout from '../components/Layout';

interface ParkingSpace {
  id: number;
  name: string;
  description: string;
  is_allocated: boolean;
  is_occupied: boolean;
  row?: number;
  column?: number;
}

interface ParkingLotLayoutProps {
  subscription?: any;
  user?: any;
  plan?: any;
}

const ParkingLotLayout: React.FC<ParkingLotLayoutProps> = ({ subscription, user, plan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const userType = Cookies.get('user_type');

  // Get props from location state if not passed directly
  const props = location.state || {};
  const currentSubscription = subscription || props.subscription;
  const currentUser = user || props.user;
  const currentPlan = plan || props.plan;

  useEffect(() => {
    const fetchParkingSpaces = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/parking-spaces`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const spaces = response.data.items || response.data;
        
        // Add grid positioning for visualization
        const spacesWithPosition = spaces.map((space: ParkingSpace, index: number) => ({
          ...space,
          row: Math.floor(index / 5) + 1, // 5 spaces per row
          column: (index % 5) + 1
        }));

        setParkingSpaces(spacesWithPosition);
      } catch (error) {
        console.error('Error fetching parking spaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpaces();
  }, [navigate]);

  const handleSpaceClick = (space: ParkingSpace) => {
    setSelectedSpace(space);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSpace(null);
  };

  const handleAssignSpace = () => {
    if (selectedSpace && currentSubscription) {
      // Navigate back to assign parking spaces with the selected space
      navigate('/assign-parking', {
        state: {
          subscription: currentSubscription,
          user: currentUser,
          plan: currentPlan,
          selectedSpace: selectedSpace
        }
      });
    }
  };

  const getSpaceColor = (space: ParkingSpace) => {
    if (space.is_occupied) return '#ef5350'; // Red for occupied
    if (space.is_allocated) return '#ff9800'; // Orange for allocated
    return '#4caf50'; // Green for available
  };

  const getSpaceStatus = (space: ParkingSpace) => {
    if (space.is_occupied) return 'Occupied';
    if (space.is_allocated) return 'Allocated';
    return 'Available';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Parking Lot Layout
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/assign-parking', {
              state: { subscription: currentSubscription, user: currentUser, plan: currentPlan }
            })}
          >
            Back to Assignment
          </Button>
        </Box>

        {currentUser && currentPlan && (
          <Box mb={3}>
            <Typography variant="h6" mb={1}>Assignment Details</Typography>
            <Box display="flex" gap={3}>
              <Typography><strong>User:</strong> {currentUser.full_name}</Typography>
              <Typography><strong>Plan:</strong> {currentPlan.name}</Typography>
              <Typography><strong>Spaces Allocated:</strong> {currentSubscription?.spaces_allocated || 0}</Typography>
            </Box>
          </Box>
        )}

        {/* Legend */}
        <Box mb={3}>
          <Typography variant="h6" mb={2}>Legend</Typography>
          <Box display="flex" gap={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', borderRadius: 1 }} />
              <Typography>Available</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#ff9800', borderRadius: 1 }} />
              <Typography>Allocated</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#ef5350', borderRadius: 1 }} />
              <Typography>Occupied</Typography>
            </Box>
          </Box>
        </Box>

        {/* Parking Lot Visualization */}
        <Box sx={{ 
          background: '#f5f5f5', 
          p: 3, 
          borderRadius: 3,
          border: '2px solid #ddd',
          position: 'relative'
        }}>
          {/* Entrance */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 2, 
            p: 1, 
            background: '#0a2a5c', 
            color: 'white',
            borderRadius: 2,
            fontWeight: 600
          }}>
            ENTRANCE
          </Box>

          {/* Parking Spaces Grid */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {parkingSpaces.map((space) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={space.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 4,
                    },
                    border: '2px solid',
                    borderColor: getSpaceColor(space),
                  }}
                  onClick={() => handleSpaceClick(space)}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {space.name}
                    </Typography>
                    <Chip
                      label={getSpaceStatus(space)}
                      size="small"
                      sx={{
                        backgroundColor: getSpaceColor(space),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    {space.description && (
                      <Typography variant="caption" display="block" mt={1} color="text.secondary">
                        {space.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Exit */}
          <Box sx={{ 
            textAlign: 'center', 
            mt: 2, 
            p: 1, 
            background: '#0a2a5c', 
            color: 'white',
            borderRadius: 2,
            fontWeight: 600
          }}>
            EXIT
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            Click on any parking space to view details and assign it to the subscription.
          </Typography>
        </Box>
      </Paper>

      {/* Space Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Parking Space Details</DialogTitle>
        <DialogContent>
          {selectedSpace && (
            <Box>
              <Typography variant="h6" mb={2}>{selectedSpace.name}</Typography>
              <Box mb={2}>
                <Typography><strong>Status:</strong></Typography>
                <Chip
                  label={getSpaceStatus(selectedSpace)}
                  sx={{
                    backgroundColor: getSpaceColor(selectedSpace),
                    color: 'white',
                    fontWeight: 600,
                    mt: 1
                  }}
                />
              </Box>
              {selectedSpace.description && (
                <Box mb={2}>
                  <Typography><strong>Description:</strong></Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSpace.description}
                  </Typography>
                </Box>
              )}
              <Box mb={2}>
                <Typography><strong>Space ID:</strong> {selectedSpace.id}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {selectedSpace && !selectedSpace.is_allocated && !selectedSpace.is_occupied && (
            <Button 
              onClick={handleAssignSpace} 
              variant="contained"
              disabled={!currentSubscription}
            >
              Assign This Space
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParkingLotLayout; 