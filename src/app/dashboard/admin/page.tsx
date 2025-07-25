"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Bar } from "react-chartjs-2";
import Image from "next/image";
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getUserRoleClient } from '@/lib/auth-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; image_url: string }>;
  total_price: number;
  status: string;
  created_at: string;
  restaurant: { name: string };
  customer: { email: string };
  deliveries?: Array<{ id: string }>;
}

interface Agent {
  id: string;
  email: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  owner: { email: string };
  created_at: string;
  is_approved: boolean;
}

const fetchStats = async () => {
  const { data } = await axios.get('/api/stats');
  return data;
};

export default function AdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/stats', fetchStats);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace('/');
        return;
      }
      const role = await getUserRoleClient(userData.user.id);
      if (role !== 'admin') {
        router.replace('/');
        return;
      }
      setIsAdmin(true);
      setCheckingRole(false);
    }
    checkRole();
  }, [router]);

  if (checkingRole) return <div>Checking permissions...</div>;
  if (!isAdmin) return <div>Access denied.</div>;
  if (isLoading) return <div>Loading dashboard data...</div>;
  if (error) return <div className="text-red-500">Failed to load stats. Please try again later.</div>;

  const { customers, restaurants, orders, deliveries, ordersByDay = [], usersByDay = [] } = data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, Admin</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded">👥 Customers: {customers}</div>
        <div className="bg-gray-100 p-4 rounded">🍽 Restaurants: {restaurants}</div>
        <div className="bg-gray-100 p-4 rounded">📦 Orders: {orders}</div>
        <div className="bg-gray-100 p-4 rounded">🚚 Deliveries: {deliveries}</div>
      </div>
      {/* Chart: Orders over last 7 days */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold mb-2">Orders (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ordersByDay} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" name="Orders" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Chart: User signups over last 7 days */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold mb-2">User Signups (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={usersByDay} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" name="Signups" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Existing dashboard UI follows */}
    </div>
  );
}

/*
-- SQL for orders_by_day_last_7 function (run in Supabase SQL editor):
create or replace function orders_by_day_last_7()
returns table(date text, count integer)
language sql
as $$
  select to_char(created_at::date, 'Mon DD') as date, count(*)
  from orders
  where created_at >= (current_date - interval '6 days')
  group by created_at::date
  order by created_at::date;
$$;
*/

/*
Add this to your global CSS for fade-in animation:
@keyframes fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
}
*/ 