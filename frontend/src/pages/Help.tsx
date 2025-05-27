import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Layout from '../components/Layout';

const faqs = [
  {
    question: 'How do I add a new vehicle?',
    answer: 'Go to the Vehicles page and click the "Add Vehicle" button. Fill in the required details and submit the form.'
  },
  {
    question: 'How can I manage my subscriptions?',
    answer: 'Navigate to the Subscriptions page to view, add, or manage your active and expired subscriptions.'
  },
  {
    question: 'Where can I see my payment history?',
    answer: 'The Payments page (coming soon) will show your payment history and allow you to manage billing information.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can use the Contact Us page from the sidebar to send a message to our support team.'
  },
  {
    question: 'How do I log out?',
    answer: 'Click the Log out button at the bottom of the sidebar to safely exit your account.'
  },
  {
    question: 'What if I forget my password?',
    answer: 'On the login page, use the "Forgot password?" link to reset your password via email.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard security practices to protect your data and privacy.'
  },
];

const Help: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>
            Help & FAQ
          </Typography>
          <Typography variant="body1" mb={4}>
            Here you'll find answers to common questions and tips for getting the most out of GateWise. If you need further assistance, please use the Contact Us page.
          </Typography>
          <List>
            {faqs.map((faq, idx) => (
              <Accordion key={idx} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Help; 