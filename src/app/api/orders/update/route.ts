export const runtime = 'nodejs';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔄 [API] Starting order status update...');
    
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
    const { orderId, newStatus } = await request.json();
    
    if (!orderId || !newStatus) {
      console.error('❌ [API] Missing required fields:', { orderId, newStatus });
      return NextResponse.json(
        { error: 'Missing orderId or newStatus' },
        { status: 400 }
      );
    }

    console.log('📝 [API] Updating order:', orderId, 'to status:', newStatus);

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ [API] Update failed:', updateError);
      return NextResponse.json(
        { error: 'Failed to update status', details: updateError },
        { status: 500 }
      );
    }

    console.log('✅ [API] Order status updated successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('💥 [API] Unexpected error in order update:', error);
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