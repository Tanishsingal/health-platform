import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const prescriptionId = params.id;

    // Check if prescription exists and is pending
    const prescriptionCheck = await query(
      'SELECT id, status FROM prescriptions WHERE id = $1',
      [prescriptionId]
    );

    if (prescriptionCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    if (prescriptionCheck.rows[0].status === 'filled') {
      return NextResponse.json(
        { success: false, error: 'Prescription already filled' },
        { status: 400 }
      );
    }

    if (prescriptionCheck.rows[0].status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Cannot fill cancelled prescription' },
        { status: 400 }
      );
    }

    // Update prescription status to filled
    const updateResult = await query(
      `UPDATE prescriptions 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      ['filled', prescriptionId]
    );

    console.log(`✅ Prescription ${prescriptionId} marked as filled by pharmacist ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        prescription: updateResult.rows[0]
      },
      message: 'Prescription filled successfully'
    });

  } catch (error: any) {
    console.error('Fill prescription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fill prescription', details: error.message },
      { status: 500 }
    );
  }
} 