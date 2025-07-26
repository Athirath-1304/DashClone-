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
  const { data: restaurants, error } = await supabase.from('restaurants').select('*');

  if (error) {
    return <div className="p-8 text-red-500">Failed to load restaurants.</div>;
  }
  if (!restaurants) {
    return <div className="p-8">Loading...</div>;
  }
  if (restaurants.length === 0) {
    return <div className="p-8 text-gray-500">No restaurants found.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Restaurants</h1>
      <div className="max-w-5xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {restaurants.map((r: Restaurant) => (
          <div key={r.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
            {r.image_url ? (
              <Image src={r.image_url} alt={r.name} width={80} height={80} className="w-20 h-20 object-cover rounded-full mb-4 border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 mb-4">
                {r.name?.[0]}
              </div>
            )}
            <h2 className="text-xl font-semibold mb-1">{r.name}</h2>
            <div className="text-gray-500 mb-4">{r.cuisine_type || 'Restaurant'}</div>
            <Link
              href={`/restaurants/${r.id}`}
              className="inline-block px-5 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              View Menu
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
} 