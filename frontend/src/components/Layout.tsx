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
  useTheme,
  useMediaQuery,
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
import Sidebar from './Sidebar';

const drawerWidth = 200;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Sidebar
        isMobile={isMobile}
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 