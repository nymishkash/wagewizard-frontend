'use client';

import { BASE_URL, wwAPI } from '@/utils/api_instance';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { LoaderCircleIcon } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await wwAPI.post('/auth/verifyToken', {
          token: localStorage.getItem('token'),
        });
        window.location.href = '/chat';
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    };

    verifyToken();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        name,
        email,
        password,
        company,
      });
      console.log('Signup successful:', response.data);
      setLoading(false);
      setSnackbarMessage(
        'Signup successful, please login with your new credentials. Redirecting now...'
      );
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Redirect after 4 seconds
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 4000);
    } catch (error) {
      console.error('Signup failed:', error);
      setLoading(false);
      setSnackbarMessage('Signup failed. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-gray-800 to-black">
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div className="text-[ffffff]">
        <Typography variant="h3" gutterBottom>
          Create your WageWizard account
        </Typography>
      </div>
      <Box className="flex flex-col border border-gray-600 rounded-lg p-5 text-[#333333] shadow-lg bg-black mt-5 w-72">
        <input
          type="text"
          placeholder="Name"
          className="mb-4 p-2 rounded placeholder:text-gray-500 border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company name"
          className="mb-4 p-2 rounded placeholder:text-gray-500 border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="mb-4 p-2 rounded placeholder:text-gray-500 border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 p-2 rounded placeholder:text-gray-500 border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="outlined"
          style={{ borderColor: '#cccccc', color: '#cccccc' }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? <LoaderCircleIcon className="animate-spin" /> : 'Signup'}
        </Button>
        <button
          className="font-light text-[#cccccc] underline text-xs mt-3 hover:text-gray-300 transition all duration-200 hover:cursor-pointer outline-0"
          onClick={() => {
            window.location.href = '/auth/login';
          }}
        >
          Existing user? Login here.
        </button>
      </Box>
    </div>
  );
};

export default SignupPage;
