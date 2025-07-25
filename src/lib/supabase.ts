import { createBrowserClient } from '@supabase/ssr';
// import type { Database } from '@/types/supabase'; // Uncomment if you have types

export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export { createSupabaseServerClient } from './supabase-server';
