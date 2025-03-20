'use client';

import { Button, Box } from '@mui/material';

const HomePage = () => {
  return (
    <div className="h-screen flex w-full items-center justify-center">
      <Box className="flex flex-col border border-gray-600 rounded-lg p-5 shadow-lg bg-black mt-5 w-72">
        <Button
          variant="contained"
          style={{
            backgroundColor: '#cccccc',
            color: '#333333',
            marginBottom: '10px',
            transition: 'background-color 0.3s, transform 0.3s',
          }}
          onClick={() => {
            window.location.href = '/chat';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b3b3b3';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#cccccc';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Chat
        </Button>
        <Button
          variant="outlined"
          style={{
            borderColor: '#cccccc',
            color: '#cccccc',
            transition: 'border-color 0.3s, transform 0.3s',
          }}
          onClick={() => {
            window.location.href = '/emp-dir';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#b3b3b3';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cccccc';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          View Employee Directory
        </Button>
      </Box>
    </div>
  );
};

export default HomePage;
