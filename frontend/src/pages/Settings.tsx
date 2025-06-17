import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import Layout from '../components/Layout';
import UsersTab from '../components/settings/UsersTab';
import PlansTab from '../components/settings/PlansTab';
import SubscriptionsTab from '../components/settings/SubscriptionsTab';
import ParkingSpacesTab from '../components/settings/ParkingSpacesTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Layout>
      <Box sx={{ p: 4, background: '#f7f7f7', minHeight: '100vh' }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          Settings
        </Typography>
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="settings tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  minHeight: 64,
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Users" {...a11yProps(0)} />
              <Tab label="Plans" {...a11yProps(1)} />
              <Tab label="Subscriptions" {...a11yProps(2)} />
              <Tab label="Parking Spaces" {...a11yProps(3)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <UsersTab />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <PlansTab />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <SubscriptionsTab />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <ParkingSpacesTab />
          </TabPanel>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Settings; 