'use client';
import { ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

function LogoutButton() {
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
      Logout
    </button>
  );
}

function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard/restaurant" className="text-gray-700 hover:text-gray-900 font-medium">
            Restaurant Dashboard
          </Link>
          <Link href="/dashboard/customer" className="text-gray-700 hover:text-gray-900 font-medium">
            Customer Dashboard
          </Link>
          <Link href="/dashboard/delivery" className="text-gray-700 hover:text-gray-900 font-medium">
            Delivery Dashboard
          </Link>
          <Link href="/new-order" className="text-blue-600 hover:text-blue-800 font-medium">
            New Order
          </Link>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navigation />
      {children}
    </div>
  );
} 