import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import type { Restaurant } from '@/types';

export default async function RestaurantsPage() {
  // Fetch restaurants from Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Only fetch approved and open restaurants
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_approved', true)
    .eq('is_open', true)
    .order('name');

  if (error) {
    return <div className="p-8 text-red-500">Failed to load restaurants.</div>;
  }
  if (!restaurants) {
    return <div className="p-8">Loading...</div>;
  }
  if (restaurants.length === 0) {
    return <div className="p-8 text-gray-500">No restaurants available at the moment.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Browse Restaurants</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((r: Restaurant) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {r.image_url ? (
                  <Image 
                    src={r.image_url} 
                    alt={r.name} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {r.name?.[0]}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{r.name}</h2>
                <div className="text-gray-600 mb-3">{r.cuisine_type || 'Restaurant'}</div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">🕒</span>
                    {r.delivery_time || 30} min
                  </div>
                  {r.delivery_fee > 0 && (
                    <div className="text-sm text-gray-500">
                      ${r.delivery_fee.toFixed(2)} delivery
                    </div>
                  )}
                </div>
                <Link
                  href={`/restaurants/${r.id}`}
                  className="w-full inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-center"
                >
                  View Menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 