export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const [
    { count: customerCount },
    { count: restaurantCount },
    { count: orderCount },
    { count: deliveryCount },
    ordersByDayRes,
    usersByDayRes
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('deliveries').select('*', { count: 'exact', head: true }),
    supabase.rpc('orders_by_day_last_7', {}),
    supabase.rpc('users_by_day_last_7', {})
  ]);

  return NextResponse.json({
    customers: customerCount || 0,
    restaurants: restaurantCount || 0,
    orders: orderCount || 0,
    deliveries: deliveryCount || 0,
    ordersByDay: ordersByDayRes.data || [],
    usersByDay: usersByDayRes.data || []
  });
} 