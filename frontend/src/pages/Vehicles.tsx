import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Select,
  MenuItem,
  FormControl,
  Pagination,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

interface Owner {
  id: number;
  email: string;
  full_name: string;
}

interface Vehicle {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  color: string;
  type: string;
  owner_id: number;
  owner: Owner;
  created_at: string;
  updated_at: string;
}

interface VehicleResponse {
  items: Vehicle[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const Vehicles: React.FC = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<VehicleResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get<VehicleResponse>(`${API_BASE_URL}/api/v1/vehicles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            page: page,
            size: 10
          }
        });

        console.log('Vehicle data:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
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

    fetchVehicles();
  }, [page, navigate]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
      <Box sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={600}>
            Vehicles
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vehicles/add')}
            sx={{
              background: '#222',
              color: '#fff',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { background: '#444' }
            }}
          >
            Add Vehicle
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
                  <TableCell>License Plate</TableCell>
                  <TableCell>Make</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.license_plate}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.color}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => navigate(`/vehicles/edit/${vehicle.id}`, { state: { vehicle } })}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => navigate(`/vehicles/delete/${vehicle.id}`)}
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
  );
};

export default Vehicles; 