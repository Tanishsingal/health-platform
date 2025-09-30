import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

// =====================================================
// LOGOUT API ROUTE
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // Clear authentication cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 