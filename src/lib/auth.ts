import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function signUpWithRole(email: string, password: string, role: string) {
  const supabase = await createSupabaseServerClient();
  // Sign up user
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    return { error };
  }
  // Insert role into users table
  const { error: dbError } = await supabase.from('users').insert({ id: data.user.id, email, role });
  if (dbError) {
    return { error: dbError };
  }
  return { user: data.user };
}

export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function getUserRole(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
  if (error) return null;
  return data?.role;
} 