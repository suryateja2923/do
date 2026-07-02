import { z } from 'zod';

export const registerOwnerSchema = z.object({
  body: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    fullName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    business_name: z.string().optional(),
    businessName: z.string().optional(),
    gst_number: z.string().optional(),
    pan_number: z.string().optional(),
    documents: z.object({
      id_url: z.string().optional(),
      pan_url: z.string().optional(),
      property_proof_url: z.string().optional(),
      profile_photo_url: z.string().optional(),
    }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterOwnerDto = z.infer<typeof registerOwnerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];

export const registerUserSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>['body'];
