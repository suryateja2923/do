'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../store/ui';
import { Sun, Moon, Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Generate breadcrumb titles
  const getBreadcrumbs = () => {
    if (pathname === '/') return ['Dashboard'];
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6 text-card-foreground">
      {/* Left side: Hamburger and Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Admin</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className="text-muted-foreground">/</span>
              <span className={idx === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative hidden sm:block w-64">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search owners, properties, payments..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-primary" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <span className="font-semibold text-sm">Notifications</span>
                <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1 text-xs border-b border-border/50 pb-2">
                  <span className="font-semibold text-foreground">New Property Verification</span>
                  <span className="text-muted-foreground">Royal Palace PG submitted documents.</span>
                  <span className="text-primary/70 text-[10px] mt-1">5 mins ago</span>
                </div>
                <div className="flex flex-col gap-1 text-xs pb-1">
                  <span className="font-semibold text-foreground">Complaint Filed</span>
                  <span className="text-muted-foreground">Water heater malfunction in Sector 62.</span>
                  <span className="text-primary/70 text-[10px] mt-1">45 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              A
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="font-semibold text-sm">Admin Panel</p>
                <p className="text-xs text-muted-foreground">admin@homiepg.com</p>
              </div>
              <button
                onClick={() => (window.location.href = '/profile')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted text-left transition-colors cursor-pointer"
              >
                <User className="h-4 w-4" /> Profile Settings
              </button>
              <button
                onClick={() => (window.location.href = '/settings')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted text-left transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4" /> System Config
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('homiepg_auth_token');
                  window.location.reload();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-destructive/10 text-destructive text-left transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
