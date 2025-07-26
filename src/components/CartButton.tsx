'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  if (count === 0) return null;
  return (
    <Link
      href="/checkout"
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition text-lg"
    >
      <ShoppingCart className="w-5 h-5" />
      Cart ({count})
    </Link>
  );
} 