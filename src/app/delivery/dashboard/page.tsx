"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, CheckCircle, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryOrder {
  id: string;
  status: string;
  created_at: string;
  customer_id: string;
  restaurant_id: string;
  delivery_agent_id?: string;
  total_amount: number;
  delivery_address: string;
  delivery_instructions?: string;
  users?: { email?: string };
  restaurant?: { name: string };
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClientComponentClient();
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      router.replace('/login');
      return;
    }

    // Check role
    const { data: userMeta } = await supabase
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!userMeta || userMeta.role !== 'delivery_agent') {
      router.replace('/');
      return;
    }

    // Fetch orders assigned to this delivery agent
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        users:customer_id (id, email),
        restaurant:restaurant_id (id, name)
      `)
      .eq('delivery_agent_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (orderError) {
      setError('Failed to fetch orders.');
      setLoading(false);
      return;
    }

    setOrders(orderData || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const supabase = createClientComponentClient();
    const channel = supabase.channel('delivery_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `delivery_agent_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`,
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

  const pickupOrder = async (orderId: string) => {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'PICKED_UP' })
      .eq('id', orderId);

    if (error) {
      console.error(error);
      toast.error('Failed to mark order as picked up');
    } else {
      toast.success('Order marked as picked up!');
      fetchOrders(); // Refresh orders
    }
  };

  const deliverOrder = async (orderId: string) => {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'DELIVERED' })
      .eq('id', orderId);

    if (error) {
      console.error(error);
      toast.error('Failed to mark order as delivered');
    } else {
      toast.success('Order marked as delivered!');
      fetchOrders(); // Refresh orders
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
          <Truck className="w-8 h-8 text-indigo-600" />
          Delivery Dashboard
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Orders Assigned</h2>
            <p className="text-gray-500">You don't have any orders assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-lg">Order #{order.id.slice(-6)}</div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Restaurant</h3>
                    <p className="text-gray-600">{order.restaurant?.name || 'Unknown Restaurant'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
                    <p className="text-gray-600">{order.users?.email || order.customer_id}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                  <p className="text-gray-600">{order.delivery_address}</p>
                  {order.delivery_instructions && (
                    <p className="text-sm text-gray-500 mt-1">
                      Instructions: {order.delivery_instructions}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Items</h3>
                  <ul className="space-y-1">
                    {(Array.isArray(order.items) ? order.items : []).map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => pickupOrder(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Picked Up
                    </button>
                  )}
                  {order.status === 'PICKED_UP' && (
                    <button
                      onClick={() => deliverOrder(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Delivered
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Delivered
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PLACED':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Placed' };
      case 'ACCEPTED':
        return { color: 'bg-blue-100 text-blue-800', text: 'Accepted' };
      case 'PICKED_UP':
        return { color: 'bg-orange-100 text-orange-800', text: 'Picked Up' };
      case 'DELIVERED':
        return { color: 'bg-green-100 text-green-800', text: 'Delivered' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
} 