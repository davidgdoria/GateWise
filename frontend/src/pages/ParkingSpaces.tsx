import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const ParkingSpaces: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API call
  const parkingSpaces = [
    { id: 1, number: 'A-101', status: 'Occupied', vehicle: 'ABC123', type: 'Standard', floor: '1' },
    { id: 2, number: 'A-102', status: 'Available', vehicle: null, type: 'Standard', floor: '1' },
    { id: 3, number: 'A-103', status: 'Reserved', vehicle: 'XYZ789', type: 'Handicap', floor: '1' },
    { id: 4, number: 'B-201', status: 'Available', vehicle: null, type: 'Electric', floor: '2' },
    { id: 5, number: 'B-202', status: 'Occupied', vehicle: 'DEF456', type: 'Standard', floor: '2' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'Occupied':
        return { bg: '#ffebee', text: '#c62828' };
      case 'Reserved':
        return { bg: '#fff3e0', text: '#ef6c00' };
      default:
        return { bg: '#f5f5f5', text: '#616161' };
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Parking Spaces
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: 0, bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CarIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                  <Box>
                    <Typography variant="h6" color="#2e7d32">Available</Typography>
                    <Typography variant="h4" fontWeight={600} color="#2e7d32">
                      {parkingSpaces.filter(space => space.status === 'Available').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: 0, bgcolor: '#ffebee' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CarIcon sx={{ fontSize: 40, color: '#c62828' }} />
                  <Box>
                    <Typography variant="h6" color="#c62828">Occupied</Typography>
                    <Typography variant="h4" fontWeight={600} color="#c62828">
                      {parkingSpaces.filter(space => space.status === 'Occupied').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: 0, bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CarIcon sx={{ fontSize: 40, color: '#ef6c00' }} />
                  <Box>
                    <Typography variant="h6" color="#ef6c00">Reserved</Typography>
                    <Typography variant="h4" fontWeight={600} color="#ef6c00">
                      {parkingSpaces.filter(space => space.status === 'Reserved').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Parking Spaces Table */}
        <Card sx={{ borderRadius: 4, boxShadow: 0 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background: '#0a2a5c',
                  color: '#fff',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { background: '#0d3a7c' },
                }}
              >
                Add Parking Space
              </Button>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search spaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200 }}
                />
                <FormControl size="small">
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Occupied">Occupied</MenuItem>
                    <MenuItem value="Reserved">Reserved</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Space Number</TableCell>
                    <TableCell>Floor</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parkingSpaces.map((space) => (
                    <TableRow key={space.id}>
                      <TableCell>{space.number}</TableCell>
                      <TableCell>{space.floor}</TableCell>
                      <TableCell>
                        <Chip
                          label={space.type}
                          size="small"
                          sx={{
                            bgcolor: space.type === 'Electric' ? '#e3f2fd' : 
                                    space.type === 'Handicap' ? '#f3e5f5' : '#f5f5f5',
                            color: space.type === 'Electric' ? '#1565c0' :
                                  space.type === 'Handicap' ? '#7b1fa2' : '#616161',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: getStatusColor(space.status).bg,
                            color: getStatusColor(space.status).text,
                            fontSize: '0.875rem',
                          }}
                        >
                          {space.status}
                        </Box>
                      </TableCell>
                      <TableCell>{space.vehicle || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default ParkingSpaces; 