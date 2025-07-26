'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BadgeCheck, Truck, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/Skeleton';

interface DeliveryOrder {
  id: string;
  status: string;
  created_at: string;
  customer_id: string;
  delivery_agent_id?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  users?: {
    id: string;
    email: string;
  };
}

interface DeliveryUser {
  id: string;
  email: string;
}

function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${className}`}>{children}</span>;
}
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'ready':
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Ready</Badge>;
    case 'out_for_delivery':
      return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1"><Truck className="w-4 h-4" /> Out for Delivery</Badge>;
    case 'delivered':
      return <Badge className="bg-gray-200 text-gray-600 flex items-center gap-1"><Package className="w-4 h-4" /> Delivered</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-500">{status}</Badge>;
  }
}

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<DeliveryUser | null>(null);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClientComponentClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      router.replace('/login');
      return;
    }
    setUser({
      id: userData.user.id,
      email: userData.user.email || ''
    });
    // Check role
    const { data: userMeta } = await supabase.from('users').select('role').eq('id', userData.user.id).single();
    if (!userMeta || userMeta.role !== 'delivery') {
      router.replace('/');
      return;
    }
    // Fetch available orders
    const { data: availOrders, error: availError } = await supabase
      .from('orders')
      .select('*, users:customer_id (id, email)')
      .eq('status', 'ready')
      .is('delivery_agent_id', null)
      .order('created_at', { ascending: false });
    if (availError) {
      setError('Failed to fetch available orders.');
      setLoading(false);
      return;
    }
    setAvailableOrders(availOrders || []);
    // Fetch my deliveries
    const { data: myOrders, error: myError } = await supabase
      .from('orders')
      .select('*, users:customer_id (id, email)')
      .eq('delivery_agent_id', userData.user.id)
      .order('created_at', { ascending: false });
    if (myError) {
      setError('Failed to fetch your deliveries.');
      setLoading(false);
      return;
    }
    setMyDeliveries(myOrders || []);
    setLoading(false);
  }, [router]);
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
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
  }, [fetchOrders]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    const supabase = createClientComponentClient();
    await supabase.from('orders').update({ status: 'out_for_delivery', delivery_agent_id: user.id }).eq('id', orderId);
    setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
    const foundOrder = availableOrders.find((o) => o.id === orderId);
    if (foundOrder) {
      setMyDeliveries((prev) => [
        ...prev,
        { ...foundOrder, status: 'out_for_delivery', delivery_agent_id: user.id }
      ]);
    }
    toast.success('Order accepted!');
  };

  const handleMarkDelivered = async (orderId: string) => {
    const supabase = createClientComponentClient();
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    setMyDeliveries((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'delivered' } : o));
    toast.success('Order marked as delivered!');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-32 w-full" /></div>;
  }
  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2"><Truck className="w-7 h-7" /> Delivery Agent Dashboard</h1>
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
        {availableOrders.length === 0 ? (
          <div className="text-gray-500">No available orders right now.</div>
        ) : (
          <div className="grid gap-6">
            {availableOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col gap-4 transition-all hover:scale-105 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg">Order #{order.id.slice(-6)}</div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-gray-500 text-sm mb-2">Placed: {new Date(order.created_at).toLocaleString()}</div>
                <div className="mb-2">
                  <div className="font-medium mb-1">Customer: {order.users?.email || order.customer_id}</div>
                  <ul className="divide-y divide-gray-200">
                    {(order.items ?? []).map((item: any) => (
                      <li key={item.id} className="flex justify-between py-2">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200 hover:scale-105"
                  onClick={() => handleAcceptOrder(order.id)}
                >
                  Accept Order
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Deliveries</h2>
        {myDeliveries.length === 0 ? (
          <div className="text-gray-500">No deliveries assigned yet.</div>
        ) : (
          <div className="grid gap-6">
            {myDeliveries.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg">Order #{order.id.slice(-6)}</div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-gray-500 text-sm mb-2">Placed: {new Date(order.created_at).toLocaleString()}</div>
                <div className="mb-2">
                  <div className="font-medium mb-1">Customer: {order.users?.email || order.customer_id}</div>
                  <ul className="divide-y divide-gray-200">
                    {(order.items ?? []).map((item: any) => (
                      <li key={item.id} className="flex justify-between py-2">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {order.status === 'out_for_delivery' && (
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                    onClick={() => handleMarkDelivered(order.id)}
                  >
                    Mark as Delivered
                  </button>
                )}
                {order.status === 'delivered' && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold"><BadgeCheck className="w-5 h-5" /> Delivered</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
} 