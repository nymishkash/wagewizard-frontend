'use client';

import { Box, Button, Typography } from '@mui/material';

const LoginPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen ">
      <div className="text-[ffffff]">
        <Typography variant="h3" gutterBottom>
          Welcome back!
        </Typography>
      </div>
      <Box className="flex flex-col border border-gray-600 rounded-lg p-5 text-[#333333] shadow-lg bg-[#1e1e1e] mt-5 w-72">
        <input
          type="email"
          placeholder="Email"
          className="mb-4 p-2 rounded placeholder:text-gray-500 border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 p-2 rounded placeholder:text-gray-500 border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
        />
        <Button
          variant="outlined"
          style={{ borderColor: '#cccccc', color: '#cccccc' }}
        >
          Login
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
