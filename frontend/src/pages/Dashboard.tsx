import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartData = {
  labels: [
    '03 Wed', '04 Thu', '05 Fri', '06 Sat', '07 Sun', '08 Mon', '09 Tue', '10 Wed', '11 Thu', '12 Fri', '13 Sat', '14 Sun', '15 Mon', '16 Tue'
  ],
  datasets: [
    {
      label: 'Authorized',
      data: [60, 30, 35, 40, 45, 60, 70, 55, 65, 40, 35, 25, 30, 50],
      borderColor: '#2ecc40',
      backgroundColor: '#2ecc40',
      tension: 0.4,
      pointRadius: 3,
      fill: false,
    },
    {
      label: 'Blocked',
      data: [40, 20, 25, 30, 25, 20, 30, 25, 20, 30, 25, 20, 25, 30],
      borderColor: '#ff4136',
      backgroundColor: '#ff4136',
      tension: 0.4,
      pointRadius: 3,
      fill: false,
    },
  ],
};

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
              <Typography variant="h3" fontWeight={700}>12</Typography>
              <Typography variant="body2" color="#b3c6e0">23 entries this month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: 0,
            minHeight: 140,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MailOutlineIcon sx={{ fontSize: 32, mr: 2, color: '#222' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Notifications</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700}>2</Typography>
              <Typography variant="body2" color="text.secondary">New messages</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
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
            onClick={() => navigate('/subscriptions')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <SubscriptionsIcon sx={{ fontSize: 32, mr: 2, color: '#222' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Subscriptions</Typography>
                  <Typography variant="body2" color="text.secondary">2 active</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700}>$45</Typography>
              <Typography variant="body2" color="text.secondary">Next payment: <b>12/11/25</b></Typography>
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
                <Typography variant="h6" fontWeight={600}>Access</Typography>
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
    </Box>
  );
};

export default Dashboard;
