'use client';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const cartItems = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <Link
      href="/checkout"
      className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-105 z-50"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </div>
      <div className="absolute -bottom-8 right-0 bg-white text-gray-900 px-3 py-1 rounded-lg shadow-md text-sm font-medium whitespace-nowrap">
        ${total.toFixed(2)}
      </div>
    </Link>
  );
} 