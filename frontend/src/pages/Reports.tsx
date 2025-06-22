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
  Select,
  MenuItem,
  FormControl,
  Pagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Layout from '../components/Layout';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const reportRows = [
  { date: 'Premium', plate: 'AA-00-23', status: 'Authorized', location: 'Lisbon Office Door A' },
  { date: 'Basic', plate: 'AA-00-23', status: 'Blocked', location: 'Porto Office Door B' },
];

const statusColor = (status: string) => {
  if (status === 'Authorized') return { label: 'Authorized', sx: { background: '#4caf50', color: '#fff', fontWeight: 700 } };
  if (status === 'Blocked') return { label: 'Blocked', sx: { background: '#ef5350', color: '#fff', fontWeight: 700 } };
  return { label: status, sx: {} };
};

const Reports: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const userType = Cookies.get('user_type');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/v1/access_logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Transform access logs to report format
        const transformedReports = response.data.items || response.data || [];
        setReports(transformedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Reports
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
              >
                New subscription
              </Button>
            )}
            <Box display="flex" gap={2}>
              <TextField
                placeholder="search plate"
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ width: 220, background: '#fff', borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
                Export data
              </Button>
              {userType === 'admin' && (
                <FormControl size="small">
                  <Select defaultValue="id" sx={{ borderRadius: 2, fontWeight: 500 }}>
                    <MenuItem value="id">Sort by: ID</MenuItem>
                    <MenuItem value="date">Sort by: Date</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>License Plate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    {userType === 'admin' && (
                      <TableCell align="center" sx={{ fontWeight: 700 }}></TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((row: any, idx: number) => (
                    <TableRow key={row.id || idx}>
                      <TableCell>{new Date(row.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell>{row.license_plate}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.granted ? 'Authorized' : 'Blocked'}
                          sx={{ 
                            background: row.granted ? '#4caf50' : '#ef5350', 
                            color: '#fff', 
                            fontWeight: 700,
                            borderRadius: 1,
                            fontSize: 15,
                            px: 2
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.reason || 'N/A'}</TableCell>
                      {userType === 'admin' && (
                        <TableCell align="center">
                          <IconButton size="small" sx={{ color: '#222' }}><MoreVertIcon /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={20}
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
  );
};

export default Reports; 