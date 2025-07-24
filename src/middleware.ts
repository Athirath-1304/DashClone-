import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

const roleToDashboard: Record<string, string> = {
  customer: '/dashboard/customer',
  restaurant: '/dashboard/restaurant',
  delivery: '/dashboard/delivery',
  admin: '/dashboard/admin',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  // Fetch user role from users table
  const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (error || !data?.role) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  const role = data.role;
  const expectedPath = roleToDashboard[role];
  if (!pathname.startsWith(expectedPath)) {
    // Redirect to correct dashboard for their role
    return NextResponse.redirect(new URL(expectedPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 