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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Layout from '../components/Layout';
import { plansApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

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
  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Plans
        </Typography>
        <Typography>
          Plans management coming soon...
        </Typography>
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