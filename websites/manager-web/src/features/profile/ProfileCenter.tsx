'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from '@/shared';
import { formatDate } from '@/utils';
import { User, Key, Bell, Shield, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileCenter: React.FC = () => {
  const { currentUser } = useAuth();

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Preference states
  const [notifPrefs, setNotifPrefs] = useState({
    ownerKyc: true,
    propertyAudit: true,
    bookingAlert: false,
    complaintEscalation: true,
    dailyReport: false,
  });

  // Login log mock
  const loginLogs = [
    { ip: '192.168.1.104', browser: 'Chrome 124.0.0 (Windows)', location: 'Bengaluru, India', date: 'Today, 06:15 PM' },
    { ip: '192.168.1.104', browser: 'Chrome 124.0.0 (Windows)', location: 'Bengaluru, India', date: 'Yesterday, 10:20 AM' },
    { ip: '106.51.28.45', browser: 'Safari Mobile (iOS)', location: 'Bengaluru, India', date: '28 Jun 2026, 04:30 PM' },
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning('All password fields required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Passwords mismatch', { description: 'New password and confirmation fields do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Password too short', { description: 'Password must be at least 6 characters long.' });
      return;
    }

    setSubmittingPassword(true);
    setTimeout(() => {
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSubmittingPassword(false);
    }, 1000);
  };

  const handleTogglePref = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success('Preferences Updated', { description: 'Your notification preferences have been saved.' });
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Details & Info */}
      <div className="lg:col-span-1 space-y-6">
        {/* Pic & Name card */}
        <Card className="text-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl mx-auto shadow-lg shadow-primary/20">
            {currentUser?.first_name?.charAt(0) || 'M'}
          </div>
          <div>
            <h3 className="font-extrabold text-lg">
              {currentUser?.first_name} {currentUser?.last_name}
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {currentUser?.role}
            </span>
          </div>
          <div className="border-t border-border/60 pt-4 text-xs text-muted-foreground space-y-2 text-left">
            <p>
              Email: <span className="text-foreground font-semibold block mt-0.5">{currentUser?.email}</span>
            </p>
            <p>
              Phone: <span className="text-foreground font-semibold block mt-0.5">{currentUser?.phone}</span>
            </p>
            <p>
              Joined:{' '}
              <span className="text-foreground font-semibold block mt-0.5">
                {currentUser?.created_at ? formatDate(currentUser.created_at) : 'N/A'}
              </span>
            </p>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-primary" /> Notification Settings
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">New Owner KYC alerts</span>
              <input
                type="checkbox"
                checked={notifPrefs.ownerKyc}
                onChange={() => handleTogglePref('ownerKyc')}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">New Property registrations</span>
              <input
                type="checkbox"
                checked={notifPrefs.propertyAudit}
                onChange={() => handleTogglePref('propertyAudit')}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Resident booking allocations</span>
              <input
                type="checkbox"
                checked={notifPrefs.bookingAlert}
                onChange={() => handleTogglePref('bookingAlert')}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Complaint ticketing escalations</span>
              <input
                type="checkbox"
                checked={notifPrefs.complaintEscalation}
                onChange={() => handleTogglePref('complaintEscalation')}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Forms & Security logs */}
      <div className="lg:col-span-2 space-y-6">
        {/* Password changes form */}
        <Card className="space-y-6">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Key className="h-4.5 w-4.5 text-primary" /> Update Password Credentials
          </h4>

          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2 text-xs">
              <label className="text-xs font-bold text-muted-foreground">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="text-xs font-bold text-muted-foreground">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="text-xs font-bold text-muted-foreground">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit" isLoading={submittingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Login history logs */}
        <Card className="space-y-6">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-primary" /> Audit Session History
          </h4>
          <div className="space-y-4 divide-y divide-border/60">
            {loginLogs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start justify-between text-xs pt-4 ${idx === 0 ? 'pt-0 border-t-0' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    {log.browser.toLowerCase().includes('mobile') ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{log.ip}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      {log.browser} &bull; {log.location}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{log.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCenter;
