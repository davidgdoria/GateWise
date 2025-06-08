import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Mock data - replace with actual API call
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ];

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Users Management
        </Typography>
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
                Add User
              </Button>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search users..."
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
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="name">Sort by Name</MenuItem>
                    <MenuItem value="role">Sort by Role</MenuItem>
                    <MenuItem value="status">Sort by Status</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: user.status === 'Active' ? '#e8f5e9' : '#ffebee',
                            color: user.status === 'Active' ? '#2e7d32' : '#c62828',
                            fontSize: '0.875rem',
                          }}
                        >
                          {user.status}
                        </Box>
                      </TableCell>
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

export default Users; 