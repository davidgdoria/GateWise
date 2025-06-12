import React, { useState } from 'react';
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

interface Plan {
  name: string;
  value: number;
  cars: number;
}

const initialPlans: Plan[] = [
  { name: 'Basic', value: 99, cars: 5 },
  { name: 'Premium', value: 199, cars: 20 },
];

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Plan>({ name: '', value: 0, cars: 0 });

  const handleOpen = (plan?: Plan, idx?: number) => {
    setOpen(true);
    if (plan && typeof idx === 'number') {
      setForm(plan);
      setEditIndex(idx);
    } else {
      setForm({ name: '', value: 0, cars: 0 });
      setEditIndex(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', value: 0, cars: 0 });
    setEditIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...plans];
      updated[editIndex] = { ...form, value: Number(form.value), cars: Number(form.cars) };
      setPlans(updated);
    } else {
      setPlans([...plans, { ...form, value: Number(form.value), cars: Number(form.cars) }]);
    }
    handleClose();
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Plans
        </Typography>
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
          <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Number of Cars</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan, idx) => (
                  <TableRow key={plan.name + idx}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>${plan.value}</TableCell>
                    <TableCell>{plan.cars}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" sx={{ color: '#222' }} onClick={() => handleOpen(plan, idx)}><EditIcon /></IconButton>
                      <IconButton size="small" sx={{ color: '#222' }}><MoreVertIcon /></IconButton>
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
            margin="normal"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Value"
            name="value"
            type="number"
            value={form.value}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Number of Cars"
            name="cars"
            type="number"
            value={form.cars}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Plans; 