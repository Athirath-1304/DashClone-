import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface CreateOrderRequest {
  restaurant_id: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  notes?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🚀 [API] POST /api/orders/create called');
  
  try {
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    console.log('📡 [API] Supabase client created');

    // Authenticate user
    console.log('🔍 [API] Authenticating user...');
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ [API] Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!userData?.user) {
      console.error('❌ [API] No user data found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customer_id = userData.user.id;
    console.log('✅ [API] User authenticated successfully, Customer ID:', customer_id);

    // Parse request body
    const body: CreateOrderRequest = await request.json();
    console.log('📦 [API] Request body:', body);

    // Validate required fields
    if (!body.restaurant_id || !body.items || body.items.length === 0) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: restaurant_id and items are required' },
        { status: 400 }
      );
    }

    // Calculate total price
    const total_price = body.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    console.log('💰 [API] Calculated total price:', total_price);

    // Prepare order items for database
    const orderItems = body.items.map(item => ({
      name: item.name,
      quantity: item.qty,
      price: item.price
    }));

    // Create the order
    console.log('📝 [API] Creating order in database...');
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id,
        restaurant_id: body.restaurant_id,
        items: orderItems,
        total_price,
        status: 'pending',
        created_at: new Date().toISOString(),
        notes: body.notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ [API] Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    console.log('✅ [API] Order created successfully:', orderData.id);
    
    return NextResponse.json({
      message: 'Order created successfully',
      order_id: orderData.id,
      total_price,
      status: 'pending'
    });

  } catch (error) {
    console.error('💥 [API] Unexpected error in create order API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 