import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all active doctors with their profiles
    const doctorsResult = await query(`
      SELECT 
        d.id,
        d.user_id,
        d.specialization,
        d.license_number,
        d.department,
        d.consultation_fee,
        up.first_name,
        up.last_name,
        up.phone
      FROM doctors d
      LEFT JOIN user_profiles up ON d.user_id = up.user_id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE u.status = 'active'
      ORDER BY up.first_name, up.last_name
    `);

    return NextResponse.json({
      success: true,
      data: {
        doctors: doctorsResult.rows
      }
    });

  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch doctors',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 