'use client';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState } from 'react';
import type { Dish } from '@/types';

export function DishCard({ dish }: { dish: Dish }) {
  const addToCart = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  
  const cartItem = cartItems.find(item => item.dish.id === dish.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(dish);
    toast.success(`Added ${dish.name} to cart!`);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(dish.id);
      toast.success(`Removed ${dish.name} from cart`);
    } else {
      updateQuantity(dish.id, newQuantity);
      toast.success(`Updated ${dish.name} quantity`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        {dish.image_url ? (
          <Image 
            src={dish.image_url} 
            alt={dish.name} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
            {dish.name?.[0]}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{dish.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold text-indigo-600">${Number(dish.price).toFixed(2)}</div>
          {dish.category && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {dish.category}
            </span>
          )}
        </div>
        
        {currentQuantity > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(currentQuantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="font-medium w-8 text-center">{currentQuantity}</span>
              <button
                onClick={() => handleQuantityChange(currentQuantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleQuantityChange(0)}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
} 