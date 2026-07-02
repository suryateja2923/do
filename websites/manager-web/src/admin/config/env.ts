import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:2000/api/v1'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

// Next.js client-side variables are exposed via process.env
const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const parsed = envSchema.safeParse(clientEnv);

if (!parsed.success) {
  console.warn('⚠️ Frontend environment variable validation warnings:', parsed.error.format());
}

export const env = parsed.data || {
  NEXT_PUBLIC_API_URL: 'http://localhost:2000/api/v1',
};
export default env;
