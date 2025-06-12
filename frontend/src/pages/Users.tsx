import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Pagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  full_name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await apiClient.get<UserResponse>('/users', {
          params: {
            page: page,
            size: 10
          }
        });

        setData(response);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
        setData({
          items: [],
          total: 0,
          page: 1,
          size: 10,
          pages: 0
        });
      }
    };

    fetchUsers();
  }, [page, navigate]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleEdit = (id: number) => {
    const userToEdit = data.items.find(user => user.id === id);
    if (userToEdit) {
      navigate(`/users/edit/${id}`, { state: { user: userToEdit } });
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.delete(`/users/${userId}`);
        // Refresh the list
        setPage(1);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          Users
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/users/add')}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.type}</TableCell>
                    <TableCell>{user.is_active ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => handleEdit(user.id)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDelete(user.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
      </Box>
    </Layout>
  );
};

export default Users; 