'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  AlertTriangle,
  Bell,
  FileText,
  CheckSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Owner Verification', path: '/owners', icon: Users },
  { label: 'Property Verification', path: '/properties', icon: Building2 },
  { label: 'Booking Verification', path: '/bookings', icon: CalendarCheck },
  { label: 'Complaints', path: '/complaints', icon: AlertTriangle },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Profile', path: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-border bg-card text-card-foreground ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Sidebar Header Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wider text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-lg">
            H
          </div>
          {sidebarOpen && <span className="text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">HomiePG</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation Items */}
      <div className="h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer Logout */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-card">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
