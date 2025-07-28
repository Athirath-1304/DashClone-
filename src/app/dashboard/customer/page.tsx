'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

interface CustomerOrder {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  notes?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    special_instructions?: string;
  }>;
  restaurant: {
    id: string;
    name: string;
    image_url?: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  const fetchOrders = async () => {
    try {
      // Call the new API route
      const response = await fetch('/api/customer-orders');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        setError('Failed to load orders');
        return;
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('An error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('customer_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">My Orders</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <button
            onClick={() => router.push('/restaurants')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Order Food
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start your food journey by placing your first order!</p>
            <button
              onClick={() => router.push('/restaurants')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {order.restaurant.image_url ? (
                          <Image
                            src={order.restaurant.image_url}
                            alt={order.restaurant.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                            {order.restaurant.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{order.restaurant.name}</h3>
                        <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${order.total_price.toFixed(2)}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                      <div className="text-sm text-gray-600">{order.notes}</div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Ordered on {formatDate(order.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 