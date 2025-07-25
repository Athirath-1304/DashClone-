"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import Image from 'next/image';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      // Fetch restaurant
      const { data: restData } = await supabase
        .from("restaurants")
        .select("id, name, description, image_url")
        .eq("id", id)
        .single();
      setRestaurant(restData || null);
      // Fetch menu items
      if (restData) {
        const { data: menuData } = await supabase
          .from("menu_items")
          .select("id, restaurant_id, name, description, price, image_url")
          .eq("restaurant_id", id);
        setMenuItems(menuData || []);
      } else {
        setMenuItems([]);
      }
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      restaurant_id: item.restaurant_id,
    });
    toast.success("Item added to cart", {
      description: `${item.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="flex min-h-screen items-center justify-center text-xl">Restaurant not found.</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <Image
          src={restaurant.image_url}
          alt={restaurant.name}
          width={128}
          height={128}
          className="w-full h-48 object-cover rounded mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <p className="text-gray-600 mb-4">{restaurant.description}</p>
      </div>
      <h2 className="text-xl font-semibold mb-4">Menu</h2>
      {menuItems.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No menu items available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded shadow p-4 flex flex-col">
              <Image
                src={item.image_url}
                alt={item.name}
                width={128}
                height={128}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-bold text-lg mb-1">{item.name}</h3>
              <p className="text-gray-600 text-sm flex-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-black">${item.price.toFixed(2)}</span>
                <button
                  className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm transform transition-transform hover:scale-105 active:scale-95"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 