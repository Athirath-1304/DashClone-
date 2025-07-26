import { createClient } from '@supabase/supabase-js';

import { notFound } from 'next/navigation';
import { CartButton } from '@/components/CartButton';
import { DishCard } from '@/components/DishCard';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';
import type { Dish } from '@/types';

export default async function RestaurantMenuPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch restaurant details
  const { data: restaurant } = await supabase.from('restaurants').select('*').eq('id', params.id).single();
  if (!restaurant) return notFound();

  // Fetch dishes for this restaurant
  const { data: dishes, error } = await supabase.from('dishes').select('*').eq('restaurant_id', params.id);
  if (error) {
    return <div className="p-8 text-red-500">Failed to load menu.</div>;
  }
  if (!dishes) {
    return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        {restaurant.image_url ? (
          <Image src={restaurant.image_url} alt={restaurant.name} width={96} height={96} className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border" />
        ) : null}
        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <div className="text-gray-500 mb-2">{restaurant.cuisine_type}</div>
        <div className="text-gray-400 text-sm">Menu</div>
      </div>
      <div className="max-w-4xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2">
        {dishes.length === 0 ? (
          <div className="col-span-full text-gray-500">No dishes found.</div>
        ) : dishes.map((dish: Dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
      <CartButton />
    </main>
  );
} 