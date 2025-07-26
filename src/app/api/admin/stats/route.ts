import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  // Use the Service Role key for admin access (server-side only)
  const supabase = createClient(
    process.env.SUPABASE_PROJECT_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Calculate ISO string for 7 days ago
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log("7 Days Ago:", sevenDaysAgo);

  // Log all orders in the table (no filter)
  const { data: allOrders } = await supabase.from('orders').select('*');
  console.log("All orders:", allOrders);

  // Fetch total customers and restaurants
  const [{ data: customers = [] }, { data: restaurants = [] }] = await Promise.all([
    supabase.from('customers').select('*'),
    supabase.from('restaurants').select('*'),
  ]);

  // Fetch all orders from the last 7 days
  const { data: orders = [], error: orderError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', sevenDaysAgo);
  console.log("Order query error:", orderError);

  // Fetch all user signups from the last 7 days
  const { data: signups = [] } = await supabase
    .from('users')
    .select('*')
    .gte('created_at', sevenDaysAgo);

  return NextResponse.json({
    customers: Array.isArray(customers) ? customers.length : 0,
    restaurants: Array.isArray(restaurants) ? restaurants.length : 0,
    orders,
    signups: Array.isArray(signups) ? signups.length : 0
  });
} 