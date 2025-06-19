import React, { useEffect, useState } from 'react';
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
import { useVehicles } from '../hooks/useVehicles';
import { useParking } from '../hooks/useParking';
import authService from '../services/authService';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

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

interface AccessLog {
  id: number;
  license_plate: string;
  vehicle_id: number;
  user_id: number;
  granted: boolean;
  reason: string;
  timestamp: string;
}

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Payment {
  id: number;
  subscription_id: number;
  amount: number;
  paid_at: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userFullName, setUserFullName] = useState<string>('');
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<string>('vehicles');

  // Mock data for overview, dailyStats, spaces
  const overview = {
    total_entries: 42,
    total_revenue: 1234.56,
    average_duration: 45,
    peak_hours: ['12:00', '18:00'],
  };

  const {
    vehicles,
    total,
    loading: vehiclesLoading,
    error: vehiclesError,
    fetchVehicles,
  } = useVehicles();
  const { spaces, total: totalSpaces, loading: parkingLoading, error: parkingError, fetchParkingSpaces } = useParking();

  const fetchAccessLogs = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/access_logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAccessLogs(response.data.items || []);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      setError('Failed to fetch access logs');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSubscriptions(response.data.items || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to fetch subscriptions');
    }
  };

  const fetchPayments = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setPayments(response.data.items || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to fetch payments');
    }
  };

  const fetchTotalPaid = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/payments/total-paid`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTotalPaid(response.data || 0);
    } catch (error) {
      console.error('Error fetching total paid:', error);
      setError('Failed to fetch total paid amount');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUserFullName(userData.full_name || userData.username);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchVehicles(),
        fetchParkingSpaces(),
        fetchAccessLogs(),
        fetchSubscriptions(),
        fetchPayments(),
        fetchTotalPaid()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, [fetchVehicles, fetchParkingSpaces, navigate]);

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

  // Process access logs data for the chart
  const processVehiclesChartData = () => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const grantedData = new Array(14).fill(0);
    const deniedData = new Array(14).fill(0);

    accessLogs.forEach(log => {
      const logDate = log.timestamp.split('T')[0];
      const dayIndex = last14Days.indexOf(logDate);
      if (dayIndex !== -1) {
        if (log.granted) {
          grantedData[dayIndex]++;
        } else {
          deniedData[dayIndex]++;
        }
      }
    });

    return {
      labels: last14Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Granted',
          data: grantedData,
          borderColor: '#2ecc40',
          backgroundColor: '#2ecc40',
          tension: 0.4,
          pointRadius: 3,
          fill: false,
        },
        {
          label: 'Denied',
          data: deniedData,
          borderColor: '#e74c3c',
          backgroundColor: '#e74c3c',
          tension: 0.4,
          pointRadius: 3,
          fill: false,
        },
      ],
    };
  };

  // Process subscriptions data for the chart
  const processSubscriptionsChartData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const subscriptionsThisMonth = subscriptions.filter(sub => {
      const subDate = new Date(sub.created_at);
      return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
    });

    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const subscriptionsData = new Array(14).fill(0);

    subscriptionsThisMonth.forEach(sub => {
      const subDate = sub.created_at.split('T')[0];
      const dayIndex = last14Days.indexOf(subDate);
      if (dayIndex !== -1) {
        subscriptionsData[dayIndex]++;
      }
    });

    return {
      labels: last14Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'New Subscriptions',
          data: subscriptionsData,
          borderColor: '#3498db',
          backgroundColor: '#3498db',
          tension: 0.4,
          pointRadius: 3,
          fill: false,
        },
      ],
    };
  };

  // Process payments data for the chart
  const processPaymentsChartData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const paymentsThisMonth = payments.filter(payment => {
      const paymentDate = new Date(payment.paid_at);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const paymentsData = new Array(14).fill(0);

    paymentsThisMonth.forEach(payment => {
      const paymentDate = payment.paid_at.split('T')[0];
      const dayIndex = last14Days.indexOf(paymentDate);
      if (dayIndex !== -1) {
        paymentsData[dayIndex] += payment.amount;
      }
    });

    return {
      labels: last14Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Payments (€)',
          data: paymentsData,
          borderColor: '#f39c12',
          backgroundColor: '#f39c12',
          tension: 0.4,
          pointRadius: 3,
          fill: false,
        },
      ],
    };
  };

  const getChartData = () => {
    switch (selectedGraph) {
      case 'vehicles':
        return processVehiclesChartData();
      case 'subscriptions':
        return processSubscriptionsChartData();
      case 'payments':
        return processPaymentsChartData();
      default:
        return processVehiclesChartData();
    }
  };

  const getChartTitle = () => {
    switch (selectedGraph) {
      case 'vehicles':
        return 'Vehicle Access History';
      case 'subscriptions':
        return 'New Subscriptions This Month';
      case 'payments':
        return 'Payments This Month';
      default:
        return 'Vehicle Access History';
    }
  };

  const chartData = getChartData();

  const handleExportData = () => {
    // Convert access logs to CSV format
    const csvHeaders = ['ID', 'License Plate', 'Vehicle ID', 'User ID', 'Granted', 'Reason', 'Timestamp'];
    const csvData = accessLogs.map(log => [
      log.id,
      log.license_plate,
      log.vehicle_id,
      log.user_id,
      log.granted ? 'Yes' : 'No',
      log.reason,
      log.timestamp
    ]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleGraphChange = (graphType: string) => {
    setSelectedGraph(graphType);
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {/* Top bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={1}>
        <Typography variant="h5" fontWeight={600}>
          Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" sx={{ width: 36, height: 36 }} />
          <Typography fontWeight={500}>{userFullName || 'Loading...'}</Typography>
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
              <Typography variant="h3" fontWeight={700}>{total}</Typography>
              <Typography variant="body2" color="#b3c6e0">
                {accessLogs.length} total entries
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
            onClick={() => navigate('/parking-spaces')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsCarIcon sx={{ fontSize: 32, mr: 2, color: '#0a2a5c' }} />
                <Box>
                  <Typography variant="subtitle2" color="#0a2a5c">Parking Spaces</Typography>
                  <Typography variant="body2" color="#666">Total</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0a2a5c">
                {totalSpaces}
              </Typography>
              <Typography variant="body2" color="#666">
                {spaces.length} loaded
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
            onClick={() => navigate('/payments')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsCarIcon sx={{ fontSize: 32, mr: 2, color: '#0a2a5c' }} />
                <Box>
                  <Typography variant="subtitle2" color="#0a2a5c">Payments</Typography>
                  <Typography variant="body2" color="#666">Total Paid</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0a2a5c">
                €{totalPaid.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="#666">
                {payments.length} payments processed
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
                <Typography variant="h6" fontWeight={600}>{getChartTitle()}</Typography>
                <Box display="flex" gap={2}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    onClick={handleExportData}
                    disabled={accessLogs.length === 0}
                  >
                    Export data
                  </Button>
                  <FormControl size="small">
                    <Select defaultValue="14d" sx={{ borderRadius: 2, fontWeight: 500 }}>
                      <MenuItem value="14d">Last 14 Days</MenuItem>
                      <MenuItem value="30d">Last 30 Days</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <Select 
                      value={selectedGraph}
                      sx={{ borderRadius: 2, fontWeight: 500, minWidth: 120 }}
                      onChange={(e) => handleGraphChange(e.target.value)}
                    >
                      <MenuItem value="vehicles">Vehicles</MenuItem>
                      <MenuItem value="subscriptions">Subscriptions</MenuItem>
                      <MenuItem value="payments">Payments</MenuItem>
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
}
