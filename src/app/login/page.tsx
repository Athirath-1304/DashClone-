"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInClient } from "@/lib/auth-client";
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: loginError } = await signInClient(email, password);
    setLoading(false);
    if (loginError || !data?.user) {
      setError(loginError?.message || "Login failed");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    // Get authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setError('Authentication failed.');
      console.error('Supabase auth error:', userError);
      return;
    }
    const user = userData.user;
    // Fetch role from users table
    const { data: userMeta, error: roleError } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (roleError || !userMeta?.role) {
      setError('Could not determine user role.');
      console.error('Role fetch error:', roleError, userMeta);
      return;
    }
    const role = userMeta.role;
    // Redirect to dashboard based on role
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'restaurant_owner') {
      router.push('/restaurant/dashboard');
    } else if (role === 'delivery_agent') {
      router.push('/delivery/dashboard');
    } else if (role === 'customer') {
      router.push('/restaurants');
    } else {
      setError('Unknown or undefined role.');
      console.error('Unknown or undefined role:', role);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4">Log In</h2>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
} 