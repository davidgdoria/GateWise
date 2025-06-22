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
  Pagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { apiClient } from '../../services/api';

interface AccessLog {
  id: number;
  license_plate: string;
  vehicle_id: number | null;
  user_id: number | null;
  granted: boolean;
  reason: string;
  timestamp: string;
}

interface AccessLogsResponse {
  items: AccessLog[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const statusColor = (granted: boolean) => {
  if (granted) return { label: 'Authorized', sx: { background: '#4caf50', color: '#fff', fontWeight: 700 } };
  return { label: 'Blocked', sx: { background: '#ef5350', color: '#fff', fontWeight: 700 } };
};

const ReportsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAccessLogs = async (pageNum: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        size: '10',
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiClient.get<AccessLogsResponse>(`/access_logs?${params}`);
      setAccessLogs(response.items);
      setTotalPages(response.pages);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error fetching access logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessLogs(page, search);
  }, [page, search]);

  const handleExportData = () => {
    // Create CSV content
    const headers = ['Date', 'License Plate', 'Status', 'Reason'];
    const csvContent = [
      headers.join(','),
      ...accessLogs.map((log: AccessLog) => [
        new Date(log.timestamp).toLocaleDateString(),
        log.license_plate,
        log.granted ? 'Authorized' : 'Blocked',
        log.reason
      ].join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `access_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={3}>
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
          <TextField
            placeholder="search plate"
            value={search}
            onChange={handleSearchChange}
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
          <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }} onClick={handleExportData}>
            Export data
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>License Plate</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : accessLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No access logs found
                  </TableCell>
                </TableRow>
              ) : (
                accessLogs.map((log: AccessLog) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{log.license_plate}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusColor(log.granted).label}
                        sx={{ ...statusColor(log.granted).sx, borderRadius: 1, fontWeight: 700, fontSize: 15, px: 2 }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.reason}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" sx={{ color: '#222' }}><MoreVertIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && accessLogs.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
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
      </Box>
    </Box>
  );
};

export default ReportsTab; 