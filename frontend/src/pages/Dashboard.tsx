import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../hooks/useStatistics';
import { useParking } from '../hooks/useParking';
import { useVehicles } from '../hooks/useVehicles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#e0e0e0',
      },
      ticks: {
        color: '#222',
        font: { size: 12 },
      },
    },
    x: {
      grid: {
        color: '#e0e0e0',
      },
      ticks: {
        color: '#222',
        font: { size: 12 },
      },
    },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    overview,
    hourlyStats,
    dailyStats,
    loading: statsLoading,
    error: statsError,
    fetchOverview,
    fetchHourlyStats,
    fetchDailyStats,
  } = useStatistics();

  const {
    spaces,
    loading: parkingLoading,
    error: parkingError,
    fetchParkingSpaces,
  } = useParking();

  const {
    vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    fetchVehicles,
  } = useVehicles();

  useEffect(() => {
    fetchOverview();
    fetchParkingSpaces();
    fetchVehicles();
    fetchHourlyStats(new Date());
    fetchDailyStats(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), new Date());
  }, [fetchOverview, fetchParkingSpaces, fetchVehicles, fetchHourlyStats, fetchDailyStats]);

  const loading = statsLoading || parkingLoading || vehiclesLoading;
  const error = statsError || parkingError || vehiclesError;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const chartData = {
    labels: Object.keys(dailyStats),
    datasets: [
      {
        label: 'Authorized',
        data: Object.values(dailyStats),
        borderColor: '#2ecc40',
        backgroundColor: '#2ecc40',
        tension: 0.4,
        pointRadius: 3,
        fill: false,
      },
    ],
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {/* Top bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={1}>
        <Typography variant="h5" fontWeight={600}>
          Welcome back, Matthew
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" sx={{ width: 36, height: 36 }} />
          <Typography fontWeight={500}>Matthew Parker</Typography>
        </Box>
      </Box>
      {/* Cards */}
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: '#0a2a5c',
              color: '#fff',
              borderRadius: 4,
              boxShadow: 0,
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={() => navigate('/vehicles')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsCarIcon sx={{ fontSize: 32, mr: 2, color: '#fff' }} />
                <Box>
                  <Typography variant="subtitle2" color="#b3c6e0">Vehicles</Typography>
                  <Typography variant="body2" color="#b3c6e0">Active</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700}>{vehicles.length}</Typography>
              <Typography variant="body2" color="#b3c6e0">
                {overview?.total_entries || 0} entries this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: 0,
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={() => navigate('/parking')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsCarIcon sx={{ fontSize: 32, mr: 2, color: '#0a2a5c' }} />
                <Box>
                  <Typography variant="subtitle2" color="#0a2a5c">Available Spaces</Typography>
                  <Typography variant="body2" color="#666">Total</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0a2a5c">
                {spaces.filter(space => !space.is_occupied).length}
              </Typography>
              <Typography variant="body2" color="#666">
                out of {spaces.length} total spaces
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: '#fff',
              borderRadius: 4,
              boxShadow: 0,
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={() => navigate('/statistics')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsCarIcon sx={{ fontSize: 32, mr: 2, color: '#0a2a5c' }} />
                <Box>
                  <Typography variant="subtitle2" color="#0a2a5c">Revenue</Typography>
                  <Typography variant="body2" color="#666">This Month</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0a2a5c">
                ${overview?.total_revenue?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="#666">
                {overview?.average_duration || 0} min avg. duration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Access Chart Card */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4, boxShadow: 0 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Access History</Typography>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>Export data</Button>
                  <FormControl size="small">
                    <Select defaultValue="14d" sx={{ borderRadius: 2, fontWeight: 500 }}>
                      <MenuItem value="14d">Last 14 Days</MenuItem>
                      <MenuItem value="30d">Last 30 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ height: 400, width: '100%', maxWidth: 900, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Parking Overview */}
      {overview && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Parking Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Total Revenue</Typography>
                <Typography variant="h5">${overview.total_revenue.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Average Duration</Typography>
                <Typography variant="h5">{overview.average_duration} minutes</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Peak Hours</Typography>
                <Typography variant="h5">{overview.peak_hours.join(', ')}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
    </Box>
  );
}
