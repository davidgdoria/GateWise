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
import authService from '../services/authService';

const drawerWidth = 200;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

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
    <Box sx={{ background: '#f7f7f7', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <CssBaseline />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          width: '100%',
          flexGrow: 1,
          p: 4,
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