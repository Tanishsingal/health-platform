import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const patientId = params.id;

    // Verify user is a doctor
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || !['doctor', 'nurse', 'admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not authorized' },
        { status: 401 }
      );
    }

    // Get patient details
    const patientResult = await query(
      `SELECT 
        p.*,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth,
        up.gender,
        up.address,
        u.email
       FROM patients p
       INNER JOIN user_profiles up ON p.user_id = up.user_id
       INNER JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patient = patientResult.rows[0];

    // Get recent appointments (with error handling)
    let appointmentsResult = { rows: [] };
    try {
      appointmentsResult = await query(
        `SELECT * FROM appointments 
         WHERE patient_id = $1 
         ORDER BY appointment_date DESC 
         LIMIT 10`,
        [patientId]
      );
    } catch (error) {
      console.log('Appointments table not found or error fetching appointments');
    }

    // Get prescriptions (with error handling)
    let prescriptionsResult = { rows: [] };
    try {
      prescriptionsResult = await query(
        `SELECT * FROM prescriptions 
         WHERE patient_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [patientId]
      );
    } catch (error) {
      console.log('Prescriptions table not found or error fetching prescriptions');
    }

    // Get lab tests (with error handling)
    let labTestsResult = { rows: [] };
    try {
      labTestsResult = await query(
        `SELECT * FROM lab_tests 
         WHERE patient_id = $1 
         ORDER BY ordered_date DESC 
         LIMIT 10`,
        [patientId]
      );
    } catch (error) {
      console.log('Lab tests table not found or error fetching lab tests');
    }

    return NextResponse.json({
      success: true,
      data: {
        patient: patient,
        appointments: appointmentsResult.rows,
        prescriptions: prescriptionsResult.rows,
        labTests: labTestsResult.rows
      }
    });

  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 