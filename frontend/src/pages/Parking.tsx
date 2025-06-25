import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';

interface ParkingSpace {
  id: number;
  name: string;
  description: string;
  type: 'regular' | 'disabled' | 'pregnant' | 'ev';
  is_allocated: boolean;
  is_occupied: boolean;
}

interface ParkingSpaceResponse {
  items: ParkingSpace[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const ParkingSpaces: React.FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ParkingSpaceResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<ParkingSpace | null>(null);
  const userType = Cookies.get('user_type');

  useEffect(() => {
    const fetchSpaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/v1/parking-spaces`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { page, size: 10 }
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch parking spaces.');
      } finally {
        setLoading(false);
      }
    };
    fetchSpaces();
  }, [page]);

  const handleDeleteClick = (space: ParkingSpace) => {
    setSpaceToDelete(space);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!spaceToDelete) return;
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      await axios.delete(`${API_BASE_URL}/api/v1/parking-spaces/${spaceToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setData({
        ...data,
        items: data.items.filter(s => s.id !== spaceToDelete.id),
        total: data.total - 1
      });
      setDeleteDialogOpen(false);
      setSpaceToDelete(null);
    } catch (err) {
      setDeleteDialogOpen(false);
      setSpaceToDelete(null);
      setError('Failed to delete parking space.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSpaceToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ maxWidth: '100%', ml: 0, mt: 0, pl: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Parking Spaces
          </Typography>
          {userType === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: '#222',
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { background: '#444' },
              }}
              onClick={() => navigate('/parking-spaces/add')}
            >
              Add Parking Space
            </Button>
          )}
        </Box>
        <Box
          sx={{
            background: '#fff',
            borderRadius: 4,
            p: 3,
            boxShadow: 0,
            mb: 4,
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" mb={2}>{error}</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Allocated</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Occupied</TableCell>
                    {userType === 'admin' && (
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((space: ParkingSpace) => (
                    <TableRow key={space.id}>
                      <TableCell>{space.id}</TableCell>
                      <TableCell>{space.name}</TableCell>
                      <TableCell>{space.description}</TableCell>
                       <TableCell sx={{ textTransform: 'capitalize' }}>{space.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={space.is_allocated ? 'Yes' : 'No'}
                          color={space.is_allocated ? 'success' : 'default'}
                          sx={{ fontWeight: 700, fontSize: 15, px: 2 }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={space.is_occupied ? 'Yes' : 'No'}
                          color={space.is_occupied ? 'error' : 'success'}
                          sx={{ fontWeight: 700, fontSize: 15, px: 2 }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {userType === 'admin' && (
                          <>
                            <Button
                              size="small"
                              onClick={() => navigate(`/parking-spaces/edit/${space.id}`, { state: { space } })}
                              sx={{ minWidth: 0, color: '#222', mr: 1 }}
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleDeleteClick(space)}
                              sx={{ minWidth: 0, color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={data.pages}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              sx={{
                '& .Mui-selected': {
                  background: '#222',
                  color: '#fff',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Parking Space</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the parking space "{spaceToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParkingSpaces; 