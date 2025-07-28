import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function signUpWithRole(email: string, password: string, role: string) {
  const supabase = await createSupabaseServerClient();
  // Sign up user with role in options.data
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