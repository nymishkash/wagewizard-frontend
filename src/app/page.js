'use client';

import { BASE_URL, wwAPI } from '@/utils/api_instance';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);

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
