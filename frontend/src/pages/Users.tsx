import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { apiClient } from '../services/api';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  type: string;
}

interface UserResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UserResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<User>({
    id: 0,
    username: '',
    full_name: '',
    email: '',
    type: ''
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.getUsers(page, 10);
      setData(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error && error.message.includes('401')) {
        navigate('/login');
      }
      setError('Failed to fetch users');
    }
  };

  const handleOpen = (user?: User) => {
    setOpen(true);
    if (user) {
      setForm(user);
      setEditIndex(user.id);
    } else {
      setForm({ id: 0, username: '', full_name: '', email: '', type: '' });
      setEditIndex(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ id: 0, username: '', full_name: '', email: '', type: '' });
    setEditIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (editIndex) {
        await apiClient.updateUser(editIndex, form);
      } else {
        await apiClient.createUser(form);
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          Users
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => handleOpen()}
              startIcon={<AddIcon />}
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

          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.type}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={data.pages}
                page={data.page}
                onChange={handlePageChange}
                shape="rounded"
                sx={{
                  '& .Mui-selected': {
                    background: '#222',
                    color: '#fff',
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editIndex ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                name="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="full_name"
                label="Full Name"
                value={form.full_name}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Users; 