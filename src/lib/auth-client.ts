import { createSupabaseBrowserClient } from './supabase';

export async function signUpWithRoleClient(email: string, password: string, role: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    return { error };
  }
  const { error: dbError } = await supabase.from('users').insert({ id: data.user.id, email, role });
  if (dbError) {
    return { error: dbError };
  }
  return { user: data.user };
}

export async function signInClient(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function getUserRoleClient(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
  if (error) return null;
  return data?.role;
} 