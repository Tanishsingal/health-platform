import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(
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

    // Get prescription details
    const prescriptionResult = await query(
      `SELECT 
        pr.*,
        m.name as medication_name,
        m.category as medication_category,
        m.unit_price as medication_price,
        pup.first_name as patient_first_name,
        pup.last_name as patient_last_name,
        pup.phone as patient_phone,
        p.medical_record_number,
        dup.first_name as doctor_first_name,
        dup.last_name as doctor_last_name,
        d.specialization as doctor_specialization,
        d.license_number as doctor_license
       FROM prescriptions pr
       LEFT JOIN medications m ON pr.medication_id = m.id
       LEFT JOIN patients p ON pr.patient_id = p.id
       LEFT JOIN user_profiles pup ON p.user_id = pup.user_id
       LEFT JOIN doctors d ON pr.doctor_id = d.id
       LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
       WHERE pr.id = $1`,
      [prescriptionId]
    );

    if (prescriptionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        prescription: prescriptionResult.rows[0]
      }
    });

  } catch (error: any) {
    console.error('Get prescription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription', details: error.message },
      { status: 500 }
    );
  }
} 