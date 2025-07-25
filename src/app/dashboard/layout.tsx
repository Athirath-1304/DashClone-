'use client';
import { ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <LogoutButton />
      {children}
    </div>
  );
} 