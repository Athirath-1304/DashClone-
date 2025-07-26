"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithRoleClient } from "@/lib/auth-client";
import { mutate as globalMutate } from 'swr';

const roles = [
  { value: "customer", label: "Customer" },
  { value: "restaurant", label: "Restaurant Owner" },
  { value: "delivery", label: "Delivery Agent" },
  { value: "admin", label: "Admin" },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roles[0].value);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signupError } = await signUpWithRoleClient(email, password, role);
    setLoading(false);
    if (signupError) {
      setError(signupError.message || "Signup failed");
      return;
    }
    globalMutate('/api/stats'); // Revalidate stats after successful signup
    // Redirect to dashboard based on role
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'restaurant_owner':
        router.push('/restaurant/dashboard');
        break;
      case 'delivery_agent':
        router.push('/delivery/dashboard');
        break;
      case 'customer':
        router.push('/restaurants');
        break;
      default:
        // Do nothing if role is undefined or unknown
        break;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
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
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
} 