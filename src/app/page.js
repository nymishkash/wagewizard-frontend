'use client';

import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';

const Page = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await axios.post(
            'http://localhost:8081/verifyToken',
            {
              token,
            }
          );
          if (response.status === 200) {
            window.location.href = '/home';
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      };
      verifyToken();
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen text-white">
      <Typography variant="h2" gutterBottom>
        WageWizard
      </Typography>
      <Box className="flex flex-col border border-gray-600 rounded-lg p-5 shadow-lg bg-[#1e1e1e] mt-5 w-72">
        <Button
          variant="contained"
          style={{
            backgroundColor: '#cccccc',
            color: '#333333',
            marginBottom: '10px',
          }}
          onClick={() => {
            window.location.href = '/auth/login';
          }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          style={{ borderColor: '#cccccc', color: '#cccccc' }}
          onClick={() => {
            window.location.href = '/auth/signup';
          }}
        >
          Signup
        </Button>
      </Box>
    </div>
  );
};

export default Page;
