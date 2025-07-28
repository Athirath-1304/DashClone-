export const runtime = 'nodejs';

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🍽️ [API] Fetching restaurant orders...');
    
    const supabase = createServerComponentClient({ cookies });
    console.log('📡 [API] Supabase client created');

    // Authenticate user
    console.log('🔍 [API] Authenticating user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error('❌ [API] Authentication failed:', userError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('✅ [API] User authenticated:', user.id);

    // Get restaurants owned by this user
    console.log('🏪 [API] Fetching restaurants for owner:', user.id);
    const { data: restaurants, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("owner_id", user.id);

    if (restaurantError) {
      console.error('❌ [API] Restaurant fetch error:', restaurantError);
      return NextResponse.json(
        { error: restaurantError.message },
        { status: 500 }
      );
    }

    const restaurantIds = restaurants?.map((r) => r.id) || [];
    console.log('✅ [API] Found restaurants:', restaurantIds);

    if (restaurantIds.length === 0) {
      console.log('⚠️ [API] No restaurants found for user');
      return NextResponse.json({ orders: [] });
    }

    // Fetch orders for these restaurants
    console.log('📋 [API] Fetching orders for restaurants:', restaurantIds);
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id, 
        total_price, 
        status, 
        created_at, 
        items,
        notes,
        customer:customers(email, id)
      `)
      .in("restaurant_id", restaurantIds)
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
    console.error('💥 [API] Unexpected error in restaurant orders:', error);
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