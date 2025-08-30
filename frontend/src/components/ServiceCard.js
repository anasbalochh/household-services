import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 300,
  margin: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: 12,
}));

const ServiceCard = ({ service, onBook }) => (
  <StyledCard>
    <CardContent>
      <Typography variant="h6" color="primary">{service.title}</Typography>
      <Typography variant="body2" color="textSecondary">{service.description}</Typography>
      <Typography variant="body1" color="secondary">Price: ${service.price}</Typography>
      <Button variant="contained" color="primary" onClick={() => onBook(service.id)} sx={{ mt: 2 }}>
        Book Now
      </Button>
    </CardContent>
  </StyledCard>
);

export default ServiceCard;