export const runtime = 'nodejs';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    special_instructions?: string;
  }>;
  total_price: number;
  status: string;
  notes?: string;
  created_at: string;
  restaurant?: {
    id: string;
    name: string;
    image_url?: string;
  };
  customer?: {
    id: string;
    email: string;
  };
}

interface ApiResponse {
  role: string;
  orders: Order[];
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse | { error: string }>> {
  console.log('🚀 [API] GET /api/orders called');
  try {
    console.log('🔐 [API] Starting orders fetch request...');
    
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

    const userId = userData.user.id;
    console.log('✅ [API] User authenticated successfully, User ID:', userId);
    console.log('User ID:', userId);

    // Get user role
    console.log('👤 [API] Fetching user role for ID:', userId);
    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (roleError) {
      console.error('❌ [API] Role query error:', roleError);
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 403 }
      );
    }

    if (!userRole?.role) {
      console.error('❌ [API] No role found for user:', userId);
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 403 }
      );
    }

    const role = userRole.role;
    console.log('✅ [API] User role retrieved:', role);
    console.log('Role:', role);

    // Fetch orders based on role
    console.log('📋 [API] Fetching orders for role:', role);
    console.log('🔒 [API] RLS policies will automatically filter orders based on user permissions');
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        restaurant_id,
        items,
        total_price,
        status,
        notes,
        created_at,
        restaurant:restaurant_id (
          id,
          name,
          image_url
        ),
        customer:customer_id (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ [API] Orders query error:', ordersError);
      console.error('Orders query failed:', ordersError);
      console.error('❌ Orders fetch failed:', ordersError);
      console.error('❌ Orders error details:', JSON.stringify(ordersError, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to fetch orders', 
          reason: ordersError.message || 'Unknown error',
          details: ordersError
        },
        { status: 500 }
      );
    }

    console.log('✅ [API] Orders fetched successfully, count:', orders?.length || 0);
    console.log('📊 [API] Sample order data:', orders?.[0] ? {
      id: orders[0].id,
      status: orders[0].status,
      total_price: orders[0].total_price,
      restaurant_name: (orders[0].restaurant as any)?.name
    } : 'No orders found');

    // Return successful response
    const response = {
      role,
      orders: (orders as unknown as Order[]) || []
    };
    
    console.log('🎉 [API] Returning successful response with role:', role, 'and', response.orders.length, 'orders');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [API] Unexpected error in orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST(request: NextRequest): Promise<NextResponse> {
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