'use client'

import { useState } from 'react';
import useSWR from 'swr';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function CheckoutPage() {
  const { mutate } = useSWR('/api/stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Example order data; in a real app, get this from cart/store
  const orderData = {
    customer_id: 'demo-customer-id',
    restaurant_id: 'demo-restaurant-id',
    items: [
      { id: 'item1', name: 'Pizza', price: 10, quantity: 1, image_url: '' },
    ],
    total_price: 10,
    status: 'pending',
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('orders').insert(orderData);
    setLoading(false);
    if (error) {
      setError(error.message || 'Order failed');
      return;
    }
    mutate(); // Revalidate stats after order
    setSuccess(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleOrderSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        {/* In a real app, show cart/order summary here */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Order placed successfully!</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
} 