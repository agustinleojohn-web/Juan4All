import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#101010] text-white selection:bg-[#800000] selection:text-white">
      {/* Scroll restoration on route changes */}
      <ScrollRestoration />

      {/* Top Header */}
      <Header />

      {/* Main Content Area: padding bottom on mobile so bottom nav never overlaps content */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Fixed Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Sonner Toast Notifications with Dark Theme and Rounded-lg */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#181818',
            color: '#FFFFFF',
            border: '1px solid #333333',
            borderRadius: '0.5rem', // rounded-lg
          },
        }}
      />
    </div>
  );
};
