'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BadgeCheck, BarChart2, CheckCircle, Clock, ChefHat, Truck, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';

interface AdminStats {
  customers: number;
  restaurants: number;
  orders: number;
  revenue: number;
}

interface OrderByDay {
  date: string;
  count: number;
}

interface RecentOrder {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  restaurant: { name: string };
  users?: { email?: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ordersByDay, setOrdersByDay] = useState<OrderByDay[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClientComponentClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      router.replace('/login');
      return;
    }
    // Check role
    const { data: userMeta } = await supabase.from('users').select('role').eq('id', userData.user.id).single();
    if (!userMeta || userMeta.role !== 'admin') {
      router.replace('/');
      return;
    }
    // Fetch stats
    const [{ count: customers }, { count: restaurants }, { count: orders }, { sum: revenue }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('restaurants').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_price', { head: true, count: 'exact' }).then(res => ({ sum: res.data?.reduce((acc: number, o: { total_price: number }) => acc + Number(o.total_price || 0), 0) })),
    ]);

    console.log("Orders count:", orders);
    console.log("Revenue:", revenue);
    setStats({ 
      customers: customers || 0, 
      restaurants: restaurants || 0, 
      orders: orders || 0, 
      revenue: revenue || 0 
    });
    // Orders by day (last 7 days) - fallback if RPC doesn't exist
    let ordersByDayData;
    try {
      const { data: rpcData } = await supabase.rpc('orders_by_day_last_7', {});
      ordersByDayData = rpcData;
    } catch (error) {
      console.log('RPC function not available, using fallback query');
      // Fallback: manually group orders by day
      const { data: allOrders } = await supabase
        .from('orders')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (allOrders) {
        const orderCounts = new Map();
        allOrders.forEach(order => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          orderCounts.set(date, (orderCounts.get(date) || 0) + 1);
        });
        ordersByDayData = Array.from(orderCounts.entries()).map(([date, count]) => ({ date, count }));
      }
    }
    console.log("Orders by day data:", ordersByDayData);
    setOrdersByDay(ordersByDayData || []);
    // Recent orders
    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select('id, total_price, status, created_at, restaurant:restaurant_id (name), users:customer_id (email)')
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log("Recent orders data:", recentOrdersData);
    console.log("Revenue from recent orders:", recentOrdersData?.reduce((acc, o) => acc + o.total_price, 0));
    
    setRecentOrders((recentOrdersData as unknown as RecentOrder[]) || []);
    setLoading(false);
  }, [router]);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  useEffect(() => {
    const supabase = createClientComponentClient();
    const channel = supabase.channel('orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          fetchStats();
        }
      })
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [fetchStats]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-32 w-full" /></div>;
  }
  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2"><BarChart2 className="w-7 h-7" /> Admin Dashboard</h1>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Customers" value={stats?.customers || 0} />
        <StatCard label="Restaurants" value={stats?.restaurants || 0} />
        <StatCard label="Orders" value={stats?.orders || 0} />
        <StatCard label="Revenue" value={`$${Number(stats?.revenue || 0).toFixed(2)}`} />
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="font-semibold mb-4">Orders Per Day (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={ordersByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4f46e5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="text-gray-500">No recent orders.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Order ID</th>
                <th className="py-2">Restaurant</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                  <td className="py-2 font-mono">{order.id.slice(-6)}</td>
                  <td className="py-2">{order.restaurant?.name || '-'}</td>
                  <td className="py-2">{order.users?.email || '-'}</td>
                  <td className="py-2">${Number(order.total_price).toFixed(2)}</td>
                  <td className="py-2">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-2">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-gray-500 text-sm font-medium">{label}</div>
    </div>
  );
}

function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${className}`}>{children}</span>;
}
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</Badge>;
    case 'preparing':
      return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><ChefHat className="w-4 h-4" /> Preparing</Badge>;
    case 'ready':
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Ready</Badge>;
    case 'out_for_delivery':
      return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1"><Truck className="w-4 h-4" /> Out for Delivery</Badge>;
    case 'delivered':
      return <Badge className="bg-gray-200 text-gray-600 flex items-center gap-1"><Package className="w-4 h-4" /> Delivered</Badge>;
    case 'completed':
      return <Badge className="bg-gray-200 text-gray-600 flex items-center gap-1"><BadgeCheck className="w-4 h-4" /> Completed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-500">{status}</Badge>;
  }
} 