export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'], // All bypass
  OWNER: [
    'property.create',
    'property.update',
    'bed.assign',
    'invoice.create',
  ],
  MANAGER: [
    'owner.verify',
    'owner.suspend',
    'property.read',
    'property.verify',
    'property.suspend',
    'booking.read',
    'booking.verify',
    'complaint.read',
    'complaint.resolve',
    'complaint.close',
    'task.read',
    'task.execute',
    'notification.send',
    'report.read',
  ],
  USER: [
    'booking.create',
    'complaint.file',
    'payment.pay',
  ],
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  if (userRole === 'ADMIN') return true;
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};
