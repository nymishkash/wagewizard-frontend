import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/sidebar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'WageWizard',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen">
          <div className="fixed h-screen">
            <Sidebar />
          </div>
          <div className="flex-1 ml-64 overflow-auto">
            <main className="w-full">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
