import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../redux/serviceSlice';
import ServiceCard from '../components/ServiceCard';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const Search = () => {
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector((state) => state.services);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (serviceId) => {
    console.log(`Booking service ${serviceId}`);
  };

  return (
    <StyledContainer>
      <Typography variant="h4" color="primary" gutterBottom>
        Search Services
      </Typography>
      <TextField
        label="Search services..."
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4, maxWidth: 600 }}
      />
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Grid container>
        {filteredServices.map((service) => (
          <Grid item key={service.id}>
            <ServiceCard service={service} onBook={handleBook} />
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
};

export default Search;