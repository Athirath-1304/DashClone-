"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError("");

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !loginData?.user) {
      setError(loginError?.message || "Login failed");
      setLoading(false);
      return;
    }

    const user = loginData.user;

    // Role fetch
    const { data: userMeta, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError || !userMeta?.role) {
      setError("Could not determine user role.");
      console.error("Role fetch error:", roleError, userMeta);
      setLoading(false);
      return;
    }

    const role = userMeta.role;

    // Role-based navigation
    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'restaurant_owner') router.push('/restaurant/dashboard');
    else if (role === 'delivery_agent') router.push('/delivery/dashboard');
    else if (role === 'customer') router.push('/restaurants');
    else {
      setError("Unknown or undefined role.");
      console.error("Unknown or undefined role:", role);
    }

    setLoading(false);
  }

  async function handleDevLogin(email: string) {
    // Dev passwords - adjust these based on your test users
    const passwords = {
      'restaurant@example.com': 'password123',
      'customer@test.com': 'password123',
      'bommerlaathirath@gmail.com': 'password123'
    };
    
    const password = passwords[email as keyof typeof passwords] || 'password123';
    await handleLogin(email, password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
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

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Dev Quick Login Buttons */}
        <div className="border-t pt-4 mt-6">
          <p className="text-xs text-gray-500 mb-3 text-center">Dev Quick Login</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDevLogin('restaurant@example.com')}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
              disabled={loading}
            >
              Login as Restaurant
            </button>
            <button
              type="button"
              onClick={() => handleDevLogin('customer@test.com')}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
              disabled={loading}
            >
              Login as Customer
            </button>
            <button
              type="button"
              onClick={() => handleDevLogin('bommerlaathirath@gmail.com')}
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
              disabled={loading}
            >
              Login as Admin
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 