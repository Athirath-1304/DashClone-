'use client';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-20 px-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">Order Placed!</h1>
        <p className="mb-6 text-gray-700">Thank you for your order. Your food is being prepared and will be delivered soon.</p>
        <Link
          href="/restaurants"
          className="inline-block px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Back to Restaurants
        </Link>
      </div>
    </main>
  );
} 