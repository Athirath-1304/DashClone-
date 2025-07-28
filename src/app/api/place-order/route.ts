export const runtime = 'nodejs';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PlaceOrderRequest {
  items: OrderItem[];
  restaurant_id: string;
  total_price: number;
  notes?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🛒 [API] Starting order placement...');
    
    // Create Supabase client
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

    // Parse request body
    const body: PlaceOrderRequest = await request.json();
    const { items, restaurant_id, total_price, notes } = body;

    // Validate required fields
    if (!items || !restaurant_id || !total_price) {
      console.error('❌ [API] Missing required fields:', { items, restaurant_id, total_price });
      return NextResponse.json(
        { error: 'Missing required fields: items, restaurant_id, or total_price' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      console.error('❌ [API] No items in order');
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    console.log('📝 [API] Creating order with:', {
      customer_id: user.id,
      restaurant_id,
      total_price,
      items_count: items.length
    });

    // Insert order into orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        restaurant_id,
        total_price,
        status: 'PLACED',
        notes: notes || null,
        items: items // Store items as JSONB for simplicity
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('❌ [API] Order creation failed:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError },
        { status: 500 }
      );
    }

    const orderId = orderData.id;
    console.log('✅ [API] Order created successfully with ID:', orderId);

    // Note: If you have a separate order_items table, you would insert items here
    // For now, we're storing items as JSONB in the orders table for simplicity

    console.log('🎉 [API] Order placement completed successfully');
    return NextResponse.json({
      success: true,
      order_id: orderId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('💥 [API] Unexpected error in order placement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 