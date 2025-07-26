"use client";
import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface CustomerRestaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<CustomerRestaurant[]>([]);

  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, description, image_url")
        .eq("is_approved", true);
      if (!error && data) {
        setRestaurants(data);
      } else {
        setRestaurants([]);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, Customer</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search restaurants... (coming soon)"
          className="w-full border rounded px-3 py-2 mb-4"
          disabled
        />
        <h2 className="text-lg font-semibold mb-2">Restaurants</h2>
        {restaurants.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No restaurants available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurants.map(r => (
              <RestaurantCard
                key={r.id}
                id={r.id}
                name={r.name}
                description={r.description}
                imageUrl={r.image_url || ''}
              />
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Orders</h2>
        <div className="bg-gray-50 rounded p-4 text-center">Order List Placeholder</div>
      </div>
    </div>
  );
} 