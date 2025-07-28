import { createSupabaseBrowserClient } from './supabase';

export async function signUpWithRoleClient(email: string, password: string, role: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        role: role
      }
    }
  });
  if (error || !data.user) {
    return { error };
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