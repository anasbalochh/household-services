import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#2e7d32', // Green theme
});

const Header = () => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Household Services</Link>
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">Home</Button>
          {!token ? (
            <>
              <Button color="inherit" component={Link} to="/vendor-login">Vendor Login</Button>
              <Button color="inherit" component={Link} to="/customer-login">Customer Login</Button>
            </>
          ) : (
            <>
              {role === 'vendor' && (
                <Button color="inherit" component={Link} to="/service-creation">Create Service</Button>
              )}
              {role === 'customer' && (
                <Button color="inherit" component={Link} to="/booking-details/1">Booking Details</Button>
              )}
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;