import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  DirectionsCar as CarIcon, 
  Security as SecurityIcon, 
  Speed as SpeedIcon,
  Notifications as NotificationsIcon,
  Login as LoginIcon,
  ContactMail as ContactIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CarIcon fontSize="large" color="primary" />,
      title: 'Automated License Plate Recognition',
      description: 'Seamless vehicle entry and exit without traditional tickets or RFID devices.'
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Fraud Detection',
      description: 'Advanced security measures to prevent unauthorized access and parking violations.'
    },
    {
      icon: <SpeedIcon fontSize="large" color="primary" />,
      title: 'Real-time Monitoring',
      description: 'Instant tracking of vehicle movements and parking status across all facilities.'
    },
    {
      icon: <NotificationsIcon fontSize="large" color="primary" />,
      title: 'Smart Alerts',
      description: 'Automated notifications for security incidents, occupancy levels, and system events.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/parking-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      py: 4
    }}>
      {/* Top Navigation */}
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt="GateWise Logo"
              sx={{
                height: 60,
                width: 'auto',
                mr: 2
              }}
            />
            <Typography variant="h2" component="h1" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              GateWise
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                py: 1,
                px: 3,
                fontSize: '1rem',
                borderRadius: 2,
                bgcolor: '#1976d2',
                color: 'white',
                '&:hover': {
                  bgcolor: '#1565c0'
                }
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContactIcon />}
              onClick={() => navigate('/contact')}
              sx={{
                py: 1,
                px: 3,
                fontSize: '1rem',
                borderRadius: 2,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Get in Touch
            </Button>
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => navigate('/about')}
              sx={{
                py: 1,
                px: 3,
                fontSize: '1rem',
                borderRadius: 2,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card elevation={6} sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              maxWidth: '500px',
              width: '100%'
            }}>
              <Box
                component="img"
                src="/images/parking-hero.jpg"
                alt="Smart Parking"
                sx={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <CardContent sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
                py: 1
              }}>
                <Typography variant="h6" align="center">
                  Secure • Efficient • Intelligent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          mb: 2
        }}>
          Key Features
        </Typography>
        <Typography variant="h6" color="white" align="center" paragraph sx={{ 
          mb: 3,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          Discover how GateWise can transform your parking management
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ mb: 1 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing; 