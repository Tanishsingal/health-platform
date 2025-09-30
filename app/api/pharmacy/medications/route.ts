import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Verify user is a pharmacist
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'pharmacist') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a pharmacist' },
        { status: 403 }
      );
    }

    // Get all medications
    const medicationsResult = await query(
      `SELECT * FROM medications ORDER BY name ASC`
    );

    return NextResponse.json({
      success: true,
      data: {
        medications: medicationsResult.rows
      }
    });

  } catch (error: any) {
    console.error('Get medications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medications', details: error.message },
      { status: 500 }
    );
  }
} 