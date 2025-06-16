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
  Pagination,
  Tooltip,
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={600}>
            Users
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
        <Paper sx={{ p: 3, borderRadius: 2 }}>
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
                  <TableCell>Profile</TableCell>
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
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => navigate(`/users/edit/${user.id}`, { state: { user } })}
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