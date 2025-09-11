import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Box, Card, CardContent, CardActions, Slider, Select, MenuItem, Pagination, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [ratingFilter, setRatingFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // For pagination
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Mock services data (replace with backend API in production)
    const mockServices = [
      { id: 1, name: 'Plumbing', price: 50, rating: 4.5, location: 'City A', description: 'Fix leaks and pipes' },
      { id: 2, name: 'Cleaning', price: 30, rating: 4.0, location: 'City B', description: 'Home cleaning services' },
      { id: 3, name: 'Electrical', price: 70, rating: 5.0, location: 'City A', description: 'Wiring and repairs' },
      { id: 4, name: 'Painting', price: 40, rating: 4.2, location: 'City C', description: 'Interior and exterior painting' },
      { id: 5, name: 'Gardening', price: 45, rating: 4.8, location: 'City A', description: 'Landscape design and maintenance' },
      { id: 6, name: 'Carpentry', price: 55, rating: 4.3, location: 'City B', description: 'Custom furniture and repairs' },
      { id: 7, name: 'HVAC', price: 80, rating: 4.7, location: 'City C', description: 'Heating and cooling services' },
      { id: 8, name: 'Roofing', price: 100, rating: 4.9, location: 'City A', description: 'Roof installation and repair' },
      { id: 9, name: 'Pest Control', price: 35, rating: 4.1, location: 'City B', description: 'Safe pest removal' },
    ];
    setServices(mockServices);
    setFilteredServices(mockServices);
  }, []);

  useEffect(() => {
    let filtered = [...services];
    filtered = filtered.filter(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()));
    filtered = filtered.filter(service => service.price >= priceRange[0] && service.price <= priceRange[1]);
    if (ratingFilter) filtered = filtered.filter(service => service.rating >= ratingFilter);
    if (locationFilter) filtered = filtered.filter(service => service.location === locationFilter);
    if (sortBy === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'ratingDesc') filtered.sort((a, b) => b.rating - a.rating);
    setFilteredServices(filtered);
  }, [searchTerm, priceRange, ratingFilter, locationFilter, sortBy, services]);

  const handleBook = (serviceId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { redirectTo: `/customer-dashboard?book=${serviceId}` } });
    } else {
      navigate(`/customer-dashboard?book=${serviceId}`);
    }
  };

  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Welcome to Household Services
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Explore our wide range of services available for your home needs.
      </Typography>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Box sx={{ width: 200 }}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={200}
          />
        </Box>
        <Select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Ratings</MenuItem>
          <MenuItem value={4.0}>4.0+</MenuItem>
          <MenuItem value={4.5}>4.5+</MenuItem>
          <MenuItem value={5.0}>5.0</MenuItem>
        </Select>
        <Select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Locations</MenuItem>
          <MenuItem value="City A">City A</MenuItem>
          <MenuItem value="City B">City B</MenuItem>
          <MenuItem value="City C">City C</MenuItem>
        </Select>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Sort By</MenuItem>
          <MenuItem value="priceAsc">Price Low-High</MenuItem>
          <MenuItem value="priceDesc">Price High-Low</MenuItem>
          <MenuItem value="ratingDesc">Rating High-Low</MenuItem>
        </Select>
      </Box>
      <Grid container spacing={3}>
        {paginatedServices.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{service.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Price: ${service.price}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Rating: {service.rating || 'N/A'} / 5
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Location: {service.location}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => handleBook(service.id)}
                  disabled={!token}
                  sx={{ mb: 1 }}
                >
                  {token ? 'Book Now' : 'Login to Book'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(filteredServices.length / itemsPerPage)}
        page={currentPage}
        onChange={(_, page) => setCurrentPage(page)}
        sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

export default Home;