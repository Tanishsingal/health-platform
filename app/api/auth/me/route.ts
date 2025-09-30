import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/database';

// =====================================================
// CURRENT USER API ROUTE
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      );
    }

    // Get user from database
    const userResult = await query(
      'SELECT id, email, role, status, email_verified, created_at FROM users WHERE id = $1 AND status = $2',
      [payload.userId, 'active']
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get current user API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 