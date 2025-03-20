'use client';

import { usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut } from 'lucide-react';
import { Typography } from '@mui/material';

const Sidebar = () => {
  const pathname = usePathname();

  // Check if sidebar should be hidden
  if (pathname === '/' || pathname.startsWith('/auth/')) {
    return null;
  }

  const isActive = (path) => {
    return pathname === path;
  };

  const handleLogout = () => {
    // Clear everything in localStorage
    localStorage.clear();
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-gray-800 to-black text-white flex flex-col border-r border-gray-700">
      <div className="p-6">
        <Typography variant="h5" className="font-bold mb-8">
          WageWizard
        </Typography>
      </div>

      <div className="flex-1">
        <nav className="space-y-2 px-4">
          <a
            href="/chat"
            className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
              isActive('/chat')
                ? 'bg-white/20 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <MessageSquare size={20} className="mr-3" />
            <span>Chat</span>
          </a>

          <a
            href="/manage"
            className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
              isActive('/manage')
                ? 'bg-white/20 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Users size={20} className="mr-3" />
            <span>Manage</span>
          </a>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 w-full text-left rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-200"
        >
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
