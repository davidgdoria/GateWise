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
  value: number;
  cars: number;
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Plan>({ id: 0, name: '', value: 0, cars: 0 });
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
      setPlans(response as Plan[]);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to fetch plans');
    }
  };

  const handleOpen = (plan?: Plan, idx?: number) => {
    setOpen(true);
    if (plan && typeof idx === 'number') {
      setForm(plan);
      setEditIndex(idx);
    } else {
      setForm({ id: 0, name: '', value: 0, cars: 0 });
      setEditIndex(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ id: 0, name: '', value: 0, cars: 0 });
    setEditIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editIndex !== null) {
        await plansApi.updatePlan(form.id, form);
      } else {
        await plansApi.createPlan(form);
      }
      await fetchPlans();
      handleClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Failed to save plan');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await plansApi.deletePlan(id);
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Failed to delete plan');
    }
  };

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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
              onClick={() => handleOpen()}
            >
              New plan
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Cars</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan, index) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>${plan.value}</TableCell>
                    <TableCell>{plan.cars}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(plan, index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(plan.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editIndex !== null ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="value"
            label="Value"
            type="number"
            value={form.value}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="cars"
            label="Cars"
            type="number"
            value={form.cars}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Plans; 