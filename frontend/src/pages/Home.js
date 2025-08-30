import React from 'react';
import { Container, Typography, TextField, Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ServiceCard from '../components/ServiceCard';
import { useNavigate } from 'react-router-dom';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
}));

const HeroSection = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(4),
  borderRadius: 12,
  marginBottom: theme.spacing(4),
}));

const SearchSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const mockServices = [
  { id: 1, title: 'Plumbing', description: 'Fix leaks and pipes', price: 50 },
  { id: 2, title: 'Cleaning', description: 'Deep house cleaning', price: 80 },
  { id: 3, title: 'Electrical', description: 'Wiring and repairs', price: 60 },
];

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/search');
  };

  const handleBook = (serviceId) => {
    navigate('/customer-dashboard');
  };

  return (
    <StyledContainer>
      <HeroSection>
        <Typography variant="h3" color="primary" gutterBottom>
          Find Household Services
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Connect with trusted vendors for plumbing, cleaning, and more.
        </Typography>
      </HeroSection>
      <SearchSection>
        <form onSubmit={handleSearch}>
          <TextField
            label="Search services..."
            variant="outlined"
            fullWidth
            sx={{ maxWidth: 600, mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </form>
      </SearchSection>
      <Typography variant="h5" gutterBottom>
        Popular Services
      </Typography>
      <Grid container justifyContent="center">
        {mockServices.map((service) => (
          <Grid item key={service.id}>
            <ServiceCard service={service} onBook={handleBook} />
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
};

export default Home;