import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  padding: theme.spacing(2),
  textAlign: 'center',
  position: 'relative',
  bottom: 0,
  width: '100%',
}));

const Footer = () => (
  <StyledFooter>
    <Typography variant="body2">
      &copy; {new Date().getFullYear()} Household Services. All rights reserved.
    </Typography>
  </StyledFooter>
);

export default Footer;
