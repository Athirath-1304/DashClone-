'use client';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import Image from 'next/image';
import type { Dish } from '@/types';

export function DishCard({ dish }: { dish: Dish }) {
  const addToCart = useCartStore((s) => s.addItem);
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition-all hover:scale-105 duration-200">
      {dish.image_url ? (
        <Image src={dish.image_url} alt={dish.name} width={96} height={96} className="w-24 h-24 object-cover rounded mb-4" />
      ) : (
        <div className="w-24 h-24 rounded bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 mb-4">
          {dish.name?.[0]}
        </div>
      )}
      <h2 className="text-lg font-semibold mb-1">{dish.name}</h2>
      <div className="text-gray-500 mb-2">{dish.description}</div>
      <div className="text-indigo-600 font-bold mb-4">${Number(dish.price).toFixed(2)}</div>
      <button
        className="px-5 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all duration-200 hover:scale-105"
        onClick={() => {
          addToCart(dish);
          toast.success(`Added ${dish.name} to cart!`);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
} 