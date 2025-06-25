import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

interface ParkingLot {
  id: number;
  name: string;
  location: string;
  totalSpaces: number;
  hourlyRate: number;
  dailyRate: number;
  status: 'active' | 'inactive' | 'maintenance';
  description: string;
}

const ParkingSpacesTab: React.FC = () => {
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [lotDeleteDialogOpen, setLotDeleteDialogOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<ParkingLot | null>(null);
  const [addLotDialogOpen, setAddLotDialogOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '',
    location: '',
    totalSpaces: 0,
    hourlyRate: 0,
    dailyRate: 0,
    description: ''
  });

  // Mock data for parking lots
  const mockParkingLots: ParkingLot[] = [
    {
      id: 1,
      name: 'Downtown Parking Center',
      location: '123 Main Street, Downtown',
      totalSpaces: 150,
      hourlyRate: 2.50,
      dailyRate: 15.00,
      status: 'active',
      description: 'Multi-level parking facility in the heart of downtown'
    },
    {
      id: 2,
      name: 'Airport Parking Lot',
      location: '456 Airport Road',
      totalSpaces: 200,
      hourlyRate: 3.00,
      dailyRate: 20.00,
      status: 'active',
      description: 'Convenient parking near the airport terminal'
    },
    {
      id: 3,
      name: 'Shopping Mall Parking',
      location: '789 Mall Boulevard',
      totalSpaces: 300,
      hourlyRate: 1.50,
      dailyRate: 10.00,
      status: 'active',
      description: 'Large parking area serving the shopping mall'
    },
    {
      id: 4,
      name: 'Office Building Parking',
      location: '321 Business District',
      totalSpaces: 80,
      hourlyRate: 4.00,
      dailyRate: 25.00,
      status: 'maintenance',
      description: 'Premium parking for office building tenants'
    }
  ];

  useEffect(() => {
    // Set mock data
    setParkingLots(mockParkingLots);
  }, []);

  const handleLotDeleteClick = (lot: ParkingLot) => {
    setLotToDelete(lot);
    setLotDeleteDialogOpen(true);
  };

  const handleLotDeleteConfirm = () => {
    if (!lotToDelete) return;
    setParkingLots(parkingLots.filter(lot => lot.id !== lotToDelete.id));
    setLotDeleteDialogOpen(false);
    setLotToDelete(null);
  };

  const handleLotDeleteCancel = () => {
    setLotDeleteDialogOpen(false);
    setLotToDelete(null);
  };

  const handleAddLot = () => {
    const newLotWithId: ParkingLot = {
      id: Math.max(...parkingLots.map(lot => lot.id)) + 1,
      ...newLot,
      status: 'active'
    };
    setParkingLots([...parkingLots, newLotWithId]);
    setAddLotDialogOpen(false);
    setNewLot({
      name: '',
      location: '',
      totalSpaces: 0,
      hourlyRate: 0,
      dailyRate: 0,
      description: ''
    });
  };

  const getLotStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Parking Lots Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddLotDialogOpen(true)}
          sx={{
            background: '#222',
            color: '#fff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: '#444' },
          }}
        >
          Add Parking Lot
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {parkingLots.map((lot) => (
          <Grid item xs={12} md={6} lg={4} key={lot.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {lot.name}
                  </Typography>
                  <Chip
                    label={lot.status}
                    color={getLotStatusColor(lot.status) as any}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {lot.location}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {lot.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Rates
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        €{lot.hourlyRate}/hr
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        €{lot.dailyRate}/day
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{ color: '#222', textTransform: 'none' }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleLotDeleteClick(lot)}
                  sx={{ color: 'error.main', textTransform: 'none' }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Lot Dialog */}
      <Dialog open={lotDeleteDialogOpen} onClose={handleLotDeleteCancel}>
        <DialogTitle>Delete Parking Lot</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the parking lot "{lotToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLotDeleteCancel} color="secondary">Cancel</Button>
          <Button onClick={handleLotDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Add Lot Dialog */}
      <Dialog open={addLotDialogOpen} onClose={() => setAddLotDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Parking Lot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parking Lot Name"
                value={newLot.name}
                onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newLot.location}
                onChange={(e) => setNewLot({ ...newLot, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newLot.description}
                onChange={(e) => setNewLot({ ...newLot, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Spaces"
                value={newLot.totalSpaces}
                onChange={(e) => setNewLot({ ...newLot, totalSpaces: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Hourly Rate (€)"
                value={newLot.hourlyRate}
                onChange={(e) => setNewLot({ ...newLot, hourlyRate: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Daily Rate (€)"
                value={newLot.dailyRate}
                onChange={(e) => setNewLot({ ...newLot, dailyRate: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddLotDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleAddLot} variant="contained" sx={{ background: '#222' }}>Add Lot</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParkingSpacesTab; 