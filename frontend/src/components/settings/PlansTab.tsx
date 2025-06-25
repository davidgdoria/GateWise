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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../../config';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  num_spaces: number;
  duration_days: number;
  active: number;
}

const PlansTab: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/plans/`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            size: 10
          }
        });
        console.log('Plans API response:', response.data);
        setPlans(response.data);
      } catch (err) {
        setError('Failed to fetch plans');
      }
    };
    fetchPlans();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`${API_BASE_URL}/api/v1/plans/${planToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setPlans(plans.filter(plan => plan.id !== planToDelete.id));
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      alert('Failed to delete plan.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Plans Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/plans/add')}
          sx={{
            background: '#222',
            color: '#fff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: '#444' },
          }}
        >
          Add Plan
        </Button>
      </Box>
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 'none', 
          borderRadius: 3,
          border: '1px solid #e0e0e0',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Num Spaces</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Duration (days)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.description}</TableCell>
                <TableCell>€{plan.price.toFixed(2)}</TableCell>
                <TableCell>{plan.num_spaces}</TableCell>
                <TableCell>{plan.duration_days}</TableCell>
                <TableCell>
                  <Chip
                    label={plan.active ? 'Active' : 'Inactive'}
                    color={plan.active ? 'success' : 'default'}
                    sx={{ fontWeight: 700, fontSize: 15, px: 2 }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton size="small" onClick={() => navigate(`/plans/edit/${plan.id}`)} sx={{ color: '#222' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(plan)} sx={{ color: 'error.main' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
      />
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the plan "{planToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlansTab; 