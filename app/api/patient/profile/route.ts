import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Get patient profile
    const result = await query(
      `SELECT p.*, up.first_name, up.last_name, up.phone, up.date_of_birth, up.gender, up.address
       FROM patients p
       LEFT JOIN user_profiles up ON p.user_id = up.user_id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    const body = await request.json();
    
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      blood_type,
      height_cm,
      weight_kg,
      allergies,
      chronic_conditions,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship
    } = body;

    // Update user_profiles table
    await query(
      `UPDATE user_profiles 
       SET first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, 
           gender = $5, address = $6, updated_at = NOW()
       WHERE user_id = $7`,
      [first_name, last_name, phone, date_of_birth, gender, address, userId]
    );

    // Update patients table
    await query(
      `UPDATE patients 
       SET blood_type = $1, height_cm = $2, weight_kg = $3, allergies = $4, 
           chronic_conditions = $5, emergency_contact_name = $6, 
           emergency_contact_phone = $7, emergency_contact_relationship = $8,
           updated_at = NOW()
       WHERE user_id = $9`,
      [blood_type, height_cm, weight_kg, allergies, chronic_conditions, 
       emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 