"use client";

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function ClientRootLayout({ children }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">

      <div className="flex flex-1">
        <button
          className="md:hidden p-4 align-self-end"
          onClick={toggleSidebar} 
        >
          ☰
        </button>

        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
