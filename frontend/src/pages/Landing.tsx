import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  DirectionsCar as CarIcon, 
  Security as SecurityIcon, 
  Speed as SpeedIcon,
  Notifications as NotificationsIcon,
  Login as LoginIcon
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
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            {/* Logo Space */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
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
            <Typography variant="h5" color="white" paragraph sx={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              mb: 4
            }}>
              Advanced access control and parking management system powered by AI.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/contact')}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Contact Us
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  borderColor: 'white',
                  color: 'white',
                  mt: 2,
                  ml: 0,
                  display: 'block',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                About Us
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={6} sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <Box
                component="img"
                src="/images/parking-hero.jpg"
                alt="Smart Parking"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
              <CardContent sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white'
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
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Key Features
        </Typography>
        <Typography variant="h6" color="white" align="center" paragraph sx={{ 
          mb: 6,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          Discover how GateWise can transform your parking management
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
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
                <Box sx={{ mb: 2 }}>
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

      {/* Login CTA Section */}
      <Container maxWidth="md">
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
            color: 'white',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to get started?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Access your GateWise dashboard to manage your parking operations efficiently.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 2,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Login Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Landing; 