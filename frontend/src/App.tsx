import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import AddVehicle from './pages/AddVehicle';
import Subscriptions from './pages/Subscriptions';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import AddSubscription from './pages/AddSubscription';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ContactUsInternal from './pages/ContactUsInternal';
import Help from './pages/Help';
import Plans from './pages/Plans';
import Cookies from 'js-cookie';
import EditVehicle from './pages/EditVehicle';
import Users from './pages/Users';
import EditUser from './pages/EditUser';
import ProtectedRoute from './components/ProtectedRoute';
import AddUser from './pages/AddUser';
import AddPlan from './pages/AddPlan';
import EditPlan from './pages/EditPlan';
import ParkingSpaces from './pages/Parking';
import AddParkingSpace from './pages/AddParkingSpace';
import EditParkingSpace from './pages/EditParkingSpace';
import AssignParkingSpaces from './pages/AssignParkingSpaces';

const queryClient = new QueryClient();

const adminOnlyRoutes = [
  '/vehicles/add', '/alerts', '/settings', '/subscriptions/add', '/reports', '/payments', '/dashboard/contact', '/help', '/plans', '/about', '/contact', '/users', '/parking-spaces'
];

// Protected route component
const ProtectedRouteComponent = ({ children }: { children: React.ReactNode }) => {
  const location = window.location.pathname;
  const userType = Cookies.get('user_type');

  // All users can access dashboard, vehicles, subscriptions
  if (
    location.startsWith('/dashboard') ||
    location.startsWith('/vehicles') && location !== '/vehicles/add' ||
    location.startsWith('/subscriptions') && location !== '/subscriptions/add'
  ) {
    return <>{children}</>;
  }

  // Only admins can access adminOnlyRoutes
  if (adminOnlyRoutes.some((route) => location.startsWith(route))) {
    if (userType === 'admin') {
      return <>{children}</>;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Default: allow
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/vehicles" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Vehicles />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/vehicles/add" element={
              <ProtectedRouteComponent>
                <Layout>
                  <AddVehicle />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/vehicles/edit/:id" element={
              <ProtectedRouteComponent>
                <Layout>
                  <EditVehicle />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/users" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/users/add" element={
              <ProtectedRouteComponent>
                <Layout>
                  <AddUser />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/users/edit/:id" element={
              <ProtectedRouteComponent>
                <Layout>
                  <EditUser />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/alerts" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Alerts />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/settings" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/subscriptions" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Subscriptions />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/subscriptions/add" element={
              <ProtectedRouteComponent>
                <Layout>
                  <AddSubscription />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/reports" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/payments" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/dashboard/contact" element={
              <ProtectedRouteComponent>
                <Layout>
                  <ContactUsInternal />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/help" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Help />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/plans" element={
              <ProtectedRouteComponent>
                <Layout>
                  <Plans />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/plans/add" element={
              <ProtectedRouteComponent>
                <Layout>
                  <AddPlan />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/plans/edit/:id" element={
              <ProtectedRouteComponent>
                <Layout>
                  <EditPlan />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/parking-spaces" element={
              <ProtectedRouteComponent>
                <Layout>
                  <ParkingSpaces />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/parking-spaces/add" element={
              <ProtectedRouteComponent>
                <Layout>
                  <AddParkingSpace />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/parking-spaces/edit/:id" element={
              <ProtectedRouteComponent>
                <Layout>
                  <EditParkingSpace />
                </Layout>
              </ProtectedRouteComponent>
            } />
            <Route path="/assign-parking" element={
              <ProtectedRouteComponent>
                <Layout>
                  <AssignParkingSpaces />
                </Layout>
              </ProtectedRouteComponent>
            } />

            
            {/* Redirect to landing page for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 