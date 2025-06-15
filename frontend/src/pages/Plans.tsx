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
  Pagination,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Layout from '../components/Layout';
import { plansApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import API_BASE_URL from '../config';

interface Plan {
  id: number;
  name: string;
  price: number;
  num_spaces: number;
  description: string;
  duration_days: number;
  active: number;
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/v1/plans/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            size: 10
          }
        });
        console.log('Plans API response:', response.data);
        setPlans(response.data);
      } catch (err) {
        setError('Failed to fetch plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/plans/edit/${id}`);
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
        window.location.href = '/login';
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
    <Layout>
      <Box sx={{ maxWidth: '100%', ml: 0, mt: 0, pl: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Plans
          </Typography>
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
            onClick={() => navigate('/plans/add')}
          >
            Add Plan
          </Button>
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
                  {Array.isArray(plans) && plans.map((plan: Plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>{plan.description}</TableCell>
                      <TableCell>{plan.price}</TableCell>
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
                        <IconButton size="small" onClick={() => handleEdit(plan.id)} sx={{ color: '#222' }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(plan)} sx={{ color: 'error.main' }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
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
    </Layout>
  );
};

export default Plans;

/* Original implementation commented out for future use
const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Plan>({
    id: 0,
    name: '',
    price: 0,
    num_spaces: 0,
    description: '',
    duration_days: 30,
    active: 1
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await plansApi.getPlans();
      setPlans(response.items);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to fetch plans');
    }
  };

  // const handleOpen = (plan?: Plan, idx?: number) => {
  //   setOpen(true);
  //   if (plan && typeof idx === 'number') {
  //     setForm(plan);
  //     setEditIndex(idx);
  //   } else {
  //     setForm({
  //       id: 0,
  //       name: '',
  //       price: 0,
  //       num_spaces: 0,
  //       description: '',
  //       duration_days: 30,
  //       active: 1
  //     });
  //     setEditIndex(null);
  //   }
  // };

  // const handleClose = () => {
  //   setOpen(false);
  //   setForm({
  //     id: 0,
  //     name: '',
  //     price: 0,
  //     num_spaces: 0,
  //     description: '',
  //     duration_days: 30,
  //     active: 1
  //   });
  //   setEditIndex(null);
  // };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
  //   setForm({ ...form, [e.target.name]: value });
  // };

  // const handleSave = async () => {
  //   try {
  //     if (editIndex !== null) {
  //       await plansApi.updatePlan(form.id, form);
  //     } else {
  //       await plansApi.createPlan(form);
  //     }
  //     await fetchPlans();
  //     handleClose();
  //   } catch (error) {
  //     console.error('Error saving plan:', error);
  //     setError('Failed to save plan');
  //   }
  // };

  // const handleDelete = async (id: number) => {
  //   try {
  //     await plansApi.deletePlan(id);
  //     await fetchPlans();
  //   } catch (error) {
  //     console.error('Error deleting plan:', error);
  //     setError('Failed to delete plan');
  //   }
  // };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Plans
        </Typography>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Box
          sx={{
            background: '#fff',
            borderRadius: 4,
            p: 3,
            boxShadow: 0,
            mb: 4,
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Spaces</TableCell>
                  <TableCell>Duration (days)</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan, index) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>${plan.price}</TableCell>
                    <TableCell>{plan.num_spaces}</TableCell>
                    <TableCell>{plan.duration_days}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Layout>
  );
};
*/ 