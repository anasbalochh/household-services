import React, { useState } from 'react';
import { Typography, Container, TextField, Button, Alert, Box, Avatar } from '@mui/material';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(''); // Mock for upload
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock update (in real app, send to backend)
    console.log('Updated profile:', { name, email, password, profilePic });
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={profilePic} sx={{ width: 100, height: 100, mr: 2 }} />
        <Button variant="contained" component="label">
          Upload Picture
          <input type="file" hidden onChange={handleUpload} />
        </Button>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Update Profile
        </Button>
      </Box>
      <Typography variant="h6" sx={{ mt: 4 }}>Account History</Typography>
      <Box sx={{ mt: 2 }}>
        {/* Mock history */}
        <Typography>Booking 1: Plumbing - Completed</Typography>
        <Typography>Booking 2: Cleaning - Pending</Typography>
      </Box>
    </Container>
  );
};

export default Profile;