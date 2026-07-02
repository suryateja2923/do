import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const ownerVerificationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  notes: z.string().min(5, 'Decision notes must contain at least 5 characters'),
});

export type OwnerVerificationInput = z.infer<typeof ownerVerificationSchema>;

export const ownerDocRequestSchema = z.object({
  documentTypes: z.array(z.string()).min(1, 'Please select at least one document to request'),
  notes: z.string().min(5, 'Explanation notes must contain at least 5 characters'),
});

export type OwnerDocRequestInput = z.infer<typeof ownerDocRequestSchema>;

export const propertyVerificationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  notes: z.string().min(5, 'Decision notes must contain at least 5 characters'),
});

export type PropertyVerificationInput = z.infer<typeof propertyVerificationSchema>;

export const propertyCorrectionSchema = z.object({
  corrections: z.array(z.string()).min(1, 'Please select at least one correction flag'),
  notes: z.string().min(5, 'Correction details must contain at least 5 characters'),
});

export type PropertyCorrectionInput = z.infer<typeof propertyCorrectionSchema>;

export const complaintUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  notes: z.string().min(5, 'Progress/resolution details must contain at least 5 characters'),
});

export type ComplaintUpdateInput = z.infer<typeof complaintUpdateSchema>;

export const notificationSendSchema = z.object({
  userId: z.string().min(1, 'Please select a recipient owner'),
  title: z.string().min(5, 'Title must contain at least 5 characters'),
  content: z.string().min(10, 'Message body must contain at least 10 characters'),
});

export type NotificationSendInput = z.infer<typeof notificationSendSchema>;

export const notificationBroadcastSchema = z.object({
  title: z.string().min(5, 'Announcement title must contain at least 5 characters'),
  content: z.string().min(10, 'Announcement body must contain at least 10 characters'),
});

export type NotificationBroadcastInput = z.infer<typeof notificationBroadcastSchema>;

export const taskUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLARIFICATION_REQUESTED']),
  clarificationNotes: z.string().optional(),
});

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
