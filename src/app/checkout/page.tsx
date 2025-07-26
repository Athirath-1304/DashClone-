'use client';
import { useCartStore } from '@/store/cart';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CheckoutPage() {
  const cart = useCartStore();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    const supabase = createClientComponentClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setError('You must be logged in to place an order.');
      setLoading(false);
      return;
    }
    const customer_id = userData.user.id;
    const restaurant_id = cart.items[0]?.dish.restaurant_id;
    if (!restaurant_id) {
      setError('No restaurant found in cart.');
      setLoading(false);
      return;
    }
    const items = cart.items.map(({ dish, quantity }) => ({ 
      id: dish.id, 
      name: dish.name, 
      price: dish.price, 
      quantity 
    }));
    const total_price = cart.total;
    const { error: orderError } = await supabase.from('orders').insert({
      customer_id,
      restaurant_id,
      items,
      total_price,
      status: 'pending',
      created_at: new Date().toISOString(),
      notes: notes || null,
    });
    if (orderError) {
      setError('Failed to place order.');
      setLoading(false);
      return;
    }
    cart.clearCart();
    setLoading(false);
    toast.success('Order placed successfully!');
    router.push('/order-confirmation');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      {cart.items.length === 0 ? (
        <div className="text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
          <ul className="divide-y divide-gray-200 mb-6">
            {cart.items.map((item) => (
              <li key={item.dish.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Image src={item.dish.image_url || ''} alt={item.dish.name} width={56} height={56} className="w-14 h-14 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{item.dish.name}</div>
                    <div className="text-gray-500 text-sm">${item.dish.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() => cart.updateQuantity(item.dish.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() => cart.updateQuantity(item.dish.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="ml-4 text-red-500 hover:underline transition-all duration-200 hover:scale-105"
                    onClick={() => cart.removeItem(item.dish.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mb-4 flex justify-between items-center">
            <div className="font-semibold">Subtotal</div>
            <div className="font-bold text-lg">${cart.total.toFixed(2)}</div>
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-1">Delivery Notes (optional)</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Leave at the door, call on arrival, etc."
            />
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <button
            className="w-full bg-indigo-600 text-white py-3 rounded font-semibold hover:bg-indigo-700 transition-all duration-200 hover:scale-105"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}
    </main>
  );
} 