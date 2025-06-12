import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as DirectionsCarIcon,
  Subscriptions as SubscriptionsIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Notifications as AlertsIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  ContactMail as ContactIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  LocalParking as ParkingIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';

const drawerWidth = 200;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Vehicles', icon: <DirectionsCarIcon />, path: '/vehicles' },
    { text: 'Subscriptions', icon: <SubscriptionsIcon />, path: '/subscriptions' },
    { text: 'Plans', icon: <AssignmentTurnedInIcon />, path: '/plans' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Parking Spaces', icon: <ParkingIcon />, path: '/parking-spaces' },
  ];

  return (
    <Box sx={{ display: 'flex', background: '#f7f7f7', minHeight: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          overflowX: 'hidden',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#0a2a5c',
            color: '#fff',
            borderRight: 0,
            overflowX: 'hidden',
          },
        }}
        open
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" fontWeight={700} color="#b3c6e0">
            GateWise
          </Typography>
        </Toolbar>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                color: location.pathname === item.path ? '#b3c6e0' : '#fff',
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#b3c6e0' : '#fff' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box flex={1} />
        <Divider sx={{ my: 2, background: '#b3c6e0' }} />
        <List>
          <ListItem button onClick={() => navigate('/help')}>
            <ListItemIcon sx={{ color: '#b3c6e0' }}><HelpIcon /></ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem button onClick={() => navigate('/dashboard/contact')}>
            <ListItemIcon sx={{ color: '#b3c6e0' }}><ContactIcon /></ListItemIcon>
            <ListItemText primary="Contact us" />
          </ListItem>
          <ListItem button onClick={() => navigate('/')}>
            <ListItemIcon sx={{ color: '#b3c6e0' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
        </List>
      </Drawer>
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
          background: '#f7f7f7',
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 