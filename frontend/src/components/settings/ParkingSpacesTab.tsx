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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../../config';

interface ParkingSpace {
  id: number;
  name: string;
  location: string;
  status: string;
  subscription_id?: number;
  user_full_name?: string;
}

const ParkingSpacesTab: React.FC = () => {
  const navigate = useNavigate();
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchParkingSpaces = async () => {
      setError('');
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/parking-spaces`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            page: page + 1,
            per_page: rowsPerPage
          }
        });

        setParkingSpaces(response.data.items || []);
        setTotalCount(response.data.total || 0);
      } catch (err) {
        setError('Failed to fetch parking spaces.');
        console.error('Error fetching parking spaces:', err);
      }
    };

    fetchParkingSpaces();
  }, [navigate, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'reserved':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Parking Spaces Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/parking-spaces/add')}
          sx={{
            background: '#222',
            color: '#fff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: '#444' },
          }}
        >
          Add Parking Space
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
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          '& .MuiTableHead-root': {
            backgroundColor: '#f5f5f5',
            '& .MuiTableCell-root': {
              borderBottom: '2px solid #e0e0e0',
              fontWeight: 600,
              color: '#333',
              padding: '16px',
            },
          },
          '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '& .MuiTableCell-root': {
                borderBottom: '1px solid #e0e0e0',
                padding: '16px',
                color: '#333',
              },
            },
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parkingSpaces.map((space) => (
              <TableRow key={space.id}>
                <TableCell>{space.name}</TableCell>
                <TableCell>{space.location}</TableCell>
                <TableCell>
                  <Chip
                    label={space.status}
                    color={getStatusColor(space.status) as any}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      '&.MuiChip-root': {
                        height: '24px',
                        borderRadius: '12px',
                      },
                    }}
                  />
                </TableCell>
                <TableCell>{space.user_full_name || 'Not assigned'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/parking-spaces/edit/${space.id}`)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ 
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        },
                      }}
                    >
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
        sx={{
          '.MuiTablePagination-select': {
            display: 'none',
          },
          '.MuiTablePagination-selectLabel': {
            display: 'none',
          },
          '.MuiTablePagination-displayedRows': {
            margin: 0,
          },
        }}
      />
    </Box>
  );
};

export default ParkingSpacesTab; 