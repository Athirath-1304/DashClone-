'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BadgeCheck, Loader2, Clock, ChefHat, CheckCircle, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';



const statusNext: Record<string, string | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};
type Order = {
  id: string;
  status: string;
  created_at: string;
  customer_id: string;
  users?: { email?: string };
  items?: OrderItem[];
};

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();

  const fetchOrders = async () => {
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
    if (!userMeta || userMeta.role !== 'restaurant') {
      router.replace('/');
      return;
    }
    // Find restaurant owned by this user
    const { data: restData } = await supabase.from('restaurants').select('id').eq('owner_id', userData.user.id).single();
    if (!restData) {
      setError('No restaurant found for this user.');
      setLoading(false);
      return;
    }
    // Fetch orders for this restaurant
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, users:customer_id (id, email)')
      .eq('restaurant_id', restData.id)
      .order('created_at', { ascending: false });
    if (orderError) {
      setError('Failed to fetch orders.');
      setLoading(false);
      return;
    }
    setOrders(orderData || []);
    setLoading(false);
  };
  useEffect(() => {
    fetchOrders();
  }, [router]);
  useEffect(() => {
    const supabase = createClientComponentClient();
    const channel = supabase.channel('orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          fetchOrders();
        }
      })
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    const nextStatus = statusNext[currentStatus];
    if (!nextStatus) return;
    const supabase = createClientComponentClient();
    await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
    toast.success(`Order marked as ${nextStatus.replace('_', ' ')}!`);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
  }
  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }
  if (orders.length === 0) {
    return <div className="p-8 text-gray-500 text-center">No orders yet.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Restaurant Orders</h1>
      <div className="max-w-4xl mx-auto grid gap-8 grid-cols-1">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col gap-4 transition-all hover:scale-105 duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg">Order #{order.id.slice(-6)}</div>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-gray-500 text-sm mb-2">Placed: {new Date(order.created_at).toLocaleString()}</div>
            <div className="mb-2">
              <div className="font-medium mb-1">Customer: {order.users?.email || order.customer_id}</div>
              <ul className="divide-y divide-gray-200">
                {(Array.isArray(order.items) ? order.items : []).map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-4 mt-2">
              {order.status && statusNext[order.status] && (
                <button
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200 hover:scale-105"
                  onClick={() => handleStatusUpdate(order.id, order.status)}
                >
                  Mark as {statusNext[order.status]?.replace('_', ' ').charAt(0).toUpperCase() + statusNext[order.status]?.replace('_', ' ').slice(1)}
                </button>
              )}
              {order.status === 'completed' && (
                <span className="flex items-center gap-1 text-green-600 font-semibold"><BadgeCheck className="w-5 h-5" /> Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
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

function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${className}`}>{children}</span>;
} 