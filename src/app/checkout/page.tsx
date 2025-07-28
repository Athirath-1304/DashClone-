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
    if (cart.items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const supabase = createClientComponentClient();
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setError('You must be logged in to place an order.');
        return;
      }

      const customer_id = userData.user.id;
      const restaurant_id = cart.items[0]?.dish.restaurant_id;
      
      if (!restaurant_id) {
        setError('No restaurant found in cart.');
        return;
      }

      // Check if all items are from the same restaurant
      const differentRestaurant = cart.items.some(item => item.dish.restaurant_id !== restaurant_id);
      if (differentRestaurant) {
        setError('All items must be from the same restaurant.');
        return;
      }

      // Prepare order items
      const items = cart.items.map(({ dish, quantity, special_instructions }) => ({ 
        id: dish.id, 
        name: dish.name, 
        price: dish.price, 
        quantity,
        special_instructions: special_instructions || null
      }));

      const total_price = cart.total;

      // Place the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id,
          restaurant_id,
          items,
          total_price,
          status: 'pending',
          created_at: new Date().toISOString(),
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order error:', orderError);
        setError('Failed to place order. Please try again.');
        return;
      }

      // Clear cart and show success
      cart.clearCart();
      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${orderData.id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some delicious items to your cart to get started!</p>
          <button
            onClick={() => router.push('/restaurants')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Restaurant Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Order from</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {cart.items[0]?.dish.restaurant_id ? '🍽️' : '🏪'}
              </div>
              <div>
                <div className="font-medium">Restaurant</div>
                <div className="text-sm text-gray-500">Order #{Date.now().toString().slice(-6)}</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.dish.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {item.dish.image_url ? (
                        <Image 
                          src={item.dish.image_url} 
                          alt={item.dish.name} 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {item.dish.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.dish.name}</div>
                      <div className="text-sm text-gray-500">
                        ${item.dish.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    ${(item.dish.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal</span>
              <span className="font-semibold">${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Delivery Fee</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">${cart.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Delivery Notes (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Leave at the door, call on arrival, special instructions..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </main>
  );
} 