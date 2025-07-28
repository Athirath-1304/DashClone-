'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircle, Clock, MapPin } from 'lucide-react';

interface OrderDetails {
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
  }>;
  restaurant: {
    name: string;
    image_url?: string;
  };
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          status,
          created_at,
          notes,
          items,
          restaurant:restaurant_id (
            name,
            image_url
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return;
      }

      setOrder(orderData as unknown as OrderDetails);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-20 px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-20 px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Order Not Found</h1>
          <p className="mb-6 text-gray-600">We couldn't find the order you're looking for.</p>
          <Link
            href="/dashboard/customer"
            className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-2 text-green-600">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your order has been successfully placed and is being prepared.</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Clock className="w-4 h-4" />
            <span>Order #{order.id.slice(-8)}</span>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">What happens next?</span>
            </div>
            <div className="text-sm text-green-600 space-y-1">
              <div>1. Restaurant confirms your order</div>
              <div>2. Food is prepared</div>
              <div>3. Delivery agent picks up your order</div>
              <div>4. Food is delivered to your door</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              {order.restaurant.image_url ? (
                <img src={order.restaurant.image_url} alt={order.restaurant.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-lg font-bold text-gray-400">{order.restaurant.name[0]}</span>
              )}
            </div>
            <div>
              <div className="font-medium">{order.restaurant.name}</div>
              <div className="text-sm text-gray-500">Restaurant</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span className="text-lg">${order.total_price.toFixed(2)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Delivery Notes:</div>
              <div className="text-sm text-gray-600">{order.notes}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/customer"
            className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-center"
          >
            Track My Order
          </Link>
          <Link
            href="/restaurants"
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-center"
          >
            Order More Food
          </Link>
        </div>
      </div>
    </main>
  );
} 