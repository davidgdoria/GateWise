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
  Select,
  MenuItem,
  FormControl,
  Pagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const reportRows = [
  { date: 'Premium', plate: 'AA-00-23', status: 'Authorized', location: 'Lisbon Office Door A' },
  { date: 'Basic', plate: 'AA-00-23', status: 'Blocked', location: 'Porto Office Door B' },
];

const statusColor = (status: string) => {
  if (status === 'Authorized') return { label: 'Authorized', sx: { background: '#4caf50', color: '#fff', fontWeight: 700 } };
  if (status === 'Blocked') return { label: 'Blocked', sx: { background: '#ef5350', color: '#fff', fontWeight: 700 } };
  return { label: status, sx: {} };
};

const ReportsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('2025-10-05');
  const [search, setSearch] = useState('');

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={3}>
        Reports
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          size="small"
          sx={{ width: 160, background: '#fff', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
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
          >
            New subscription
          </Button>
          <Box display="flex" gap={2}>
            <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Export data
            </Button>
            <FormControl size="small">
              <Select defaultValue="id" sx={{ borderRadius: 2, fontWeight: 500 }}>
                <MenuItem value="id">Sort by: ID</MenuItem>
                <MenuItem value="date">Sort by: Date</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>License Plate</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportRows.map((row, idx) => (
                <TableRow key={row.date + row.plate + idx}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.plate}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusColor(row.status).label}
                      sx={{ ...statusColor(row.status).sx, borderRadius: 1, fontWeight: 700, fontSize: 15, px: 2 }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" sx={{ color: '#222' }}><MoreVertIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default ReportsTab; 