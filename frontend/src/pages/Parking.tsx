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
  Button
} from '@mui/material';
import Layout from '../components/Layout';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

interface ParkingSpace {
  id: number;
  name: string;
  description: string;
  is_allocated: boolean;
  is_occupied: boolean;
}

const ParkingSpaces: React.FC = () => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSpaces(res.data.items || res.data); // handle both array and paginated
      } catch (err) {
        setError('Failed to fetch parking spaces.');
      } finally {
        setLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  return (
    <Layout>
      <Box sx={{ maxWidth: '100%', ml: 0, mt: 0, pl: 0 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Parking Spaces
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
                    <TableCell sx={{ fontWeight: 700 }}>Allocated</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Occupied</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spaces.map((space: ParkingSpace) => (
                    <TableRow key={space.id}>
                      <TableCell>{space.id}</TableCell>
                      <TableCell>{space.name}</TableCell>
                      <TableCell>{space.description}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default ParkingSpaces; 