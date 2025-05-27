import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    // Here you would send the data to your backend or show a success message
  };

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
            Contact Us
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={4}
            />
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Send
              </Button>
            </Box>
          </form>
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
              mt: 4,
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

export default ContactUs; 