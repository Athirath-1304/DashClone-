'use client'

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { CartButton } from '@/components/CartButton';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurant_id: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { id } = await params;
        const supabase = createSupabaseBrowserClient();

        // Fetch restaurant details
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .eq('is_approved', true)
          .eq('is_open', true)
          .single();

        if (!restaurantData) {
          notFound();
        }

        console.log('Restaurant data loaded:', restaurantData);
        setRestaurant(restaurantData);

        // Fetch menu items for this restaurant
        const { data: menuItemsData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', id);

        if (menuError) {
          console.error('Menu items fetch error:', menuError);
          setError('Failed to load menu.');
        } else {
          setMenuItems(menuItemsData || []);
        }
      } catch (err) {
        setError('Failed to load restaurant data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  // Cart functions
  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart!`);
  }

  function removeFromCart(itemId: string) {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }

  async function placeOrder() {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to place an order');
        return;
      }

      const { id: restaurantId } = await params;
      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const { error } = await supabase.from('orders').insert({
        customer_id: user.id,
        restaurant_id: restaurantId,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total_price: total,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Order placement error:', error);
        toast.error('Failed to place order. Please try again.');
      } else {
        toast.success('Order placed successfully!');
        setCart([]); // clear cart
      }
    } catch (err) {
      console.error('Order placement error:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading || !restaurant) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-32 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 text-red-500">{error}</div>
        </div>
      </main>
    );
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              {restaurant?.image_url ? (
                <Image 
                  src={restaurant.image_url} 
                  alt={restaurant.name || 'Restaurant'} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {restaurant?.name?.[0] || 'R'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{restaurant?.name || 'Restaurant'}</h1>
              <div className="text-gray-600 mb-2">{restaurant?.cuisine_type || 'General'}</div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>🕒 {restaurant?.delivery_time || 30} min delivery</span>
                {restaurant?.delivery_fee > 0 && (
                  <span>🚚 ${restaurant.delivery_fee.toFixed(2)} delivery fee</span>
                )}
                {restaurant?.minimum_order > 0 && (
                  <span>💰 Min order ${restaurant.minimum_order.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Menu</h2>
            {menuItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🍽️</div>
                <div>No menu items available at the moment.</div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {menuItems.map(item => (
                  <div key={item.id} className="border p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-500 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-lg text-green-600">${item.price.toFixed(2)}</p>
                      <button
                        onClick={() => addToCart(item)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-4">🛒 Your Cart</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🛒</div>
                  <div>Your cart is empty</div>
                </div>
              ) : (
                <>
                  <ul className="divide-y mb-4">
                    {cart.map(item => (
                      <li key={item.id} className="py-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="block text-red-500 text-sm mt-1 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <button
                      onClick={placeOrder}
                      disabled={placingOrder || cart.length === 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {placingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <CartButton />
    </main>
  );
} 