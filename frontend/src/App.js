import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, CardMedia, Box } from '@mui/material';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';

// Navbar Component
const Navbar = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/admin-login', '/register'].includes(location.pathname);

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Household Services Platform
        </Typography>
        {!isAuthPage && (
          <>
            <Button color="inherit" href="/">Home</Button>
            <Button color="inherit" href="/admin-dashboard">Admin Dashboard</Button>
            <Button color="inherit" href="/customer-dashboard">Customer Dashboard</Button>
            <Button color="inherit" href="/vendor-dashboard">Vendor Dashboard</Button>
            <Button color="inherit" href="/login">Login</Button>
            <Button color="inherit" href="/register">Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

// Homepage Component
const Home = () => (
  <Box
    sx={{
      backgroundImage: 'ur[](https://via.placeholder.com/1920x1080?text=Professional+Service+Image)', // Replace with a real image URL
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      color: '#fff',
      pt: 12,
      pb: 4,
    }}
  >
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6, p: 4, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Household Services
        </Typography>
        <Typography variant="h6" paragraph>
          Book reliable services with ease—connect with trusted vendors and manage your home effortlessly.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="secondary" href="/register" sx={{ mr: 2, px: 4 }}>
            Get Started
          </Button>
          <Button variant="outlined" color="inherit" href="/login" sx={{ px: 4 }}>
            Log In
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ color: '#000', backgroundColor: 'rgba(255, 255, 255, 0.9)', p: 4, borderRadius: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="https://via.placeholder.com/300x140?text=Cleaning+Service"
              alt="Cleaning Service"
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                Easy Booking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule services in just a few clicks.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="https://via.placeholder.com/300x140?text=Trusted+Vendors"
              alt="Trusted Vendors"
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                Trusted Vendors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Work with verified professionals.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="https://via.placeholder.com/300x140?text=24/7+Support"
              alt="24/7 Support"
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                24/7 Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get help anytime you need it.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;