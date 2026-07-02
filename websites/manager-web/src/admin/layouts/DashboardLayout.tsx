'use client';

import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useUIStore } from '../store/ui';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Responsive Collapsible Sidebar */}
      <Sidebar />

      {/* 2. Main content container */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Top Header navbar */}
        <Topbar />
        
        {/* Page children container body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/50">
          {children}
        </main>
        
        {/* Footer info logs */}
        <footer className="h-14 border-t border-border flex items-center justify-between px-6 text-xs text-muted-foreground bg-card">
          <span>&copy; 2026 HomiePG SaaS. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Documentation</span>
            <span className="hover:text-foreground cursor-pointer">Support Help</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
