export const runtime = 'nodejs';

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('📋 [API] Fetching customer orders...');
    
    const supabase = createServerComponentClient({ cookies });
    console.log('📡 [API] Supabase client created');

    // Authenticate user
    console.log('🔍 [API] Authenticating user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error('❌ [API] Authentication failed:', userError);
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      );
    }

    console.log('✅ [API] User authenticated:', user.id);

    // Fetch customer orders
    console.log('📋 [API] Fetching orders for customer:', user.id);
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id, 
        total_price, 
        status, 
        created_at, 
        items,
        notes,
        restaurant:restaurants(name, image_url)
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('❌ [API] Orders fetch error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [API] Orders fetched successfully, count:', orders?.length || 0);
    return NextResponse.json({ orders: orders || [] });

  } catch (error) {
    console.error('💥 [API] Unexpected error in customer orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 