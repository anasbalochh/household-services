import React, { useState, useEffect } from 'react';
import { Typography, Container, TextField, Button, Box, Table, TableBody, TableCell, TableHead, TableRow, Slider, Select, MenuItem } from '@mui/material';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [rating, setRating] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Mock services
    const mockServices = [
      { id: 1, name: 'Plumbing', price: 50, rating: 4.5, location: 'City A' },
      { id: 2, name: 'Cleaning', price: 30, rating: 4.0, location: 'City B' },
      { id: 3, name: 'Electrical', price: 70, rating: 5.0, location: 'City A' },
    ];
    setServices(mockServices);
  }, []);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleBook = (id) => {
    console.log(`Booking service ${id}`);
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    service.price >= priceRange[0] && service.price <= priceRange[1] &&
    (rating ? service.rating >= rating : true) &&
    (location ? service.location === location : true)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Search Services</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
        />
        <Box sx={{ width: 200 }}>
          <Typography>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
        </Box>
        <Select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">All Ratings</MenuItem>
          <MenuItem value={4.0}>4.0+</MenuItem>
          <MenuItem value={4.5}>4.5+</MenuItem>
          <MenuItem value={5.0}>5.0</MenuItem>
        </Select>
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          size="small"
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell>Price ($)</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredServices.map(service => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.price}</TableCell>
              <TableCell>{service.rating}</TableCell>
              <TableCell>{service.location}</TableCell>
              <TableCell>
                <Button variant="contained" onClick={() => handleBook(service.id)}>
                  Book
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Search;