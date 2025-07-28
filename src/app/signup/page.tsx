"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "customer" | "restaurant_owner" | "delivery_agent">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !role) {
      setError("Please fill in all fields");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Sign up the user with Supabase Auth using the correct structure
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role // Dynamic role based on form selection
          }
        }
      });

      if (signupError || !signupData?.user) {
        setError(signupError?.message || "Signup failed");
        setLoading(false);
        return;
      }

      const user = signupData.user;

      // If restaurant owner, create restaurant record
      if (role === 'restaurant_owner') {
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            id: crypto.randomUUID(),
            name: "New Restaurant",
            description: "A new restaurant",
            address: "123 Main St",
            phone: "",
            email: user.email,
            cuisine_type: "General",
            rating: 0,
            delivery_time: 30,
            minimum_order: 10,
            delivery_fee: 5,
            image_url: null,
            is_open: true,
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (restaurantError) {
          console.error("Restaurant insert error:", JSON.stringify(restaurantError, null, 2)); // More verbose
          setError("Failed to create restaurant profile");
          setLoading(false);
          return;
        }
      }

      // Role-based navigation
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'restaurant_owner') router.push('/restaurant/dashboard');
      else if (role === 'delivery_agent') router.push('/delivery/dashboard');
      else if (role === 'customer') router.push('/restaurants');
      else {
        setError("Unknown role");
        setLoading(false);
        return;
      }

    } catch (error) {
      console.error("Signup error:", JSON.stringify(error, null, 2)); // More verbose
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
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
            minLength={6}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={e => setRole(e.target.value as "admin" | "customer" | "restaurant_owner" | "delivery_agent")}
            required
            disabled={loading}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="restaurant_owner">Restaurant Owner</option>
            <option value="delivery_agent">Delivery Agent</option>
          </select>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
} 