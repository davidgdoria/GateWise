import React from 'react';
import { Box, Typography, Paper, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/parking-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      py: 4
    }}>
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} mb={2} sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            About Us
          </Typography>
          <Typography variant="body1" mb={3} sx={{ color: '#222', fontSize: '1.15rem' }}>
            GateWise was born as a college project, created by two friends passionate about technology and innovation. Our journey began with a simple idea: to help the automotive and parking industries become more efficient, secure, and user-friendly. We saw the challenges faced by drivers, parking lot managers, and businesses, and decided to build a solution that could make a real difference.
          </Typography>
          <Typography variant="body1" mb={3} sx={{ color: '#222', fontSize: '1.15rem' }}>
            Through late-night brainstorming sessions, countless cups of coffee, and a lot of teamwork, we developed GateWise as a modern platform to streamline vehicle access, subscriptions, and payments. Our goal is to empower organizations and individuals with tools that simplify daily operations and improve the overall parking experience.
          </Typography>
          <Typography variant="body1" mb={3} sx={{ color: '#222', fontSize: '1.15rem' }}>
            Today, GateWise continues to grow, driven by our commitment to innovation and customer satisfaction. We believe that technology can transform the way we move and park, making cities smarter and life easier for everyone.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            For more information, partnership opportunities, or to share your feedback, please contact us. We look forward to building a smarter future together!
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              mt: 2,
              ml: 0,
              display: 'block',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(33, 203, 243, 0.08)',
              }
            }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutUs; 