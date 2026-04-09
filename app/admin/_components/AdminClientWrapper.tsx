'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type AdminContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdminLayout() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminLayout must be used within an AdminClientWrapper');
  }
  return context;
}

export default function AdminClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close sidebar on path change
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  // Handle ESC key or resize to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeSidebar();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <AdminContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </AdminContext.Provider>
  );
}