import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Page = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#ffffff',
      }}
    >
      <Typography variant="h2" gutterBottom>
        WageWizard
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          backgroundColor: '#1e1e1e',
          marginTop: '20px',
          width: '300px',
        }}
      >
        <Button
          variant="contained"
          style={{
            backgroundColor: '#cccccc',
            color: '#333333',
            marginBottom: '10px',
          }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          style={{ borderColor: '#cccccc', color: '#cccccc' }}
        >
          Signup
        </Button>
      </Box>
    </div>
  );
};

export default Page;
