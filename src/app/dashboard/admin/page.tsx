"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getUserRoleClient } from '@/lib/auth-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminOrder {
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



const fetchStats = async () => {
  const { data } = await axios.get('/api/admin/stats');
  return data;
};

function groupOrdersByDate(orders: AdminOrder[]) {
  const map = new Map<string, number>();
  orders.forEach(order => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    map.set(date, (map.get(date) || 0) + 1);
  });
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

function OrdersChart({ orders }: { orders: AdminOrder[] }) {
  const data = groupOrdersByDate(orders);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#4f46e5" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboard() {
  const { data, error, isLoading } = useSWR('/api/admin/stats', fetchStats);
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

  const { customers = 0, restaurants = 0, orders = [], signups = 0 } = data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, Admin</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded">👥 Customers: {customers}</div>
        <div className="bg-gray-100 p-4 rounded">🍽 Restaurants: {restaurants}</div>
        <div className="bg-gray-100 p-4 rounded">📦 Orders (7d): {orders.length}</div>
        <div className="bg-gray-100 p-4 rounded">📝 Signups (7d): {signups}</div>
      </div>
      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="font-semibold mb-2">Orders Per Day (Last 7 Days)</h2>
        <OrdersChart orders={orders} />
      </div>
      {/* Chart components will be updated next */}
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