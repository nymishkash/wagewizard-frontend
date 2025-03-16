'use client';

const { Typography } = require('@mui/material');

const MainPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="bg-[#1e1e1e] rounded-lg shadow-lg w-96">
        <div className="p-4 border-b border-gray-600">
          <Typography variant="h5" className="text-white">
            Chat Window
          </Typography>
        </div>
        <div className="p-4 h-64 overflow-y-auto">
        </div>
        <div className="p-4 border-t border-gray-600">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-2 rounded border border-[#333333] bg-[#cccccc] outline-[#333333] font-sans"
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
