import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const ContactUsInternal: React.FC = () => {
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
    navigate('/dashboard');
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
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
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button variant="contained" type="submit" sx={{ background: '#222', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: '#444' } }}>
                Send
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ContactUsInternal; 