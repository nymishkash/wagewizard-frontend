'use client';

import { BASE_URL, wwAPI } from '@/utils/api_instance';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}/auth/login`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: email,
          password: password,
        },
      });
      console.log('Login successful:', response.data);
      if (response) {
        console.log('gg');
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('companyId', response.data.companyId);
        localStorage.setItem('userId', response.data.userId);
      }
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setLoading(false);

      window.location.href = '/chat';
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid credentials. Please try again.');
      setOpenSnackbar(true);
      setLoading(false);
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
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <div className="text-[ffffff]">
        <Typography variant="h3" gutterBottom>
          Welcome back!
        </Typography>
      </div>
      <Box className="flex flex-col border border-gray-600 rounded-lg p-5 text-[#333333] shadow-lg bg-black mt-5 w-72">
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
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <LoaderCircleIcon className="animate-spin" /> : 'Login'}
        </Button>
        <button
          className="font-light text-[#cccccc] underline text-xs mt-3 hover:text-gray-300 transition all duration-200 hover:cursor-pointer outline-0"
          onClick={() => {
            window.location.href = '/auth/signup';
          }}
        >
          New user? Sign up here.
        </button>
      </Box>
    </div>
  );
};

export default LoginPage;
