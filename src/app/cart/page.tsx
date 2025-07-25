"use client";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full pb-32">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        {items.length === 0 ? (
          <div className="text-gray-500 text-center py-16">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white rounded shadow p-3 gap-4"
              >
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="text-gray-500 text-sm">${item.price.toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      –
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Sticky checkout bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between z-20 max-w-2xl mx-auto w-full">
          <div className="mb-2 sm:mb-0">
            <span className="font-semibold text-lg">Total: </span>
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>
          <button
            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded hover:bg-gray-800 font-semibold transition mt-2 sm:mt-0"
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
} 