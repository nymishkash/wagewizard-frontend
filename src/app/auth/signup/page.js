'use client';

import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:8081/auth/signup', {
        name,
        email,
        password,
        company,
      });
      console.log('Signup successful:', response.data);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen ">
      <div className="text-[ffffff]">
        <Typography variant="h3" gutterBottom>
          Create your WageWizard account
        </Typography>
      </div>
      <Box className="flex flex-col border border-gray-600 rounded-lg p-5 text-[#333333] shadow-lg bg-[#1e1e1e] mt-5 w-72">
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
        >
          Signup
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
