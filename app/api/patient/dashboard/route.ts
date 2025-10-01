import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user info from auth token
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
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

    // Verify user is a patient
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'patient') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a patient' },
        { status: 401 }
      );
    }

    // Get patient record
    const patientResult = await query(
      `SELECT p.*, up.first_name, up.last_name, up.phone, up.date_of_birth, up.gender
       FROM patients p
       LEFT JOIN user_profiles up ON p.user_id = up.user_id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient record not found' },
        { status: 404 }
      );
    }

    const patient = patientResult.rows[0];

    // Get upcoming appointments
    const appointmentsResult = await query(
      `SELECT a.*, 
              d.specialization,
              dup.first_name as doctor_first_name,
              dup.last_name as doctor_last_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
       WHERE a.patient_id = $1 
       AND a.appointment_date >= NOW()
       ORDER BY a.appointment_date ASC
       LIMIT 5`,
      [patient.id]
    );

    // Get active prescriptions
    const prescriptionsResult = await query(
      `SELECT pr.*, m.name as medication_name
       FROM prescriptions pr
       LEFT JOIN medications m ON pr.medication_id = m.id
       WHERE pr.patient_id = $1 
       AND pr.status IN ('pending', 'filled')
       ORDER BY pr.created_at DESC
       LIMIT 10`,
      [patient.id]
    );

    // Get recent medical records
    const recordsResult = await query(
      `SELECT mr.*,
              dup.first_name as doctor_first_name,
              dup.last_name as doctor_last_name
       FROM medical_records mr
       LEFT JOIN doctors d ON mr.doctor_id = d.id
       LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
       WHERE mr.patient_id = $1
       ORDER BY mr.visit_date DESC
       LIMIT 5`,
      [patient.id]
    );

    // Get lab tests (with error handling)
    let labTestsResult = { rows: [] };
    try {
      labTestsResult = await query(
        `SELECT lt.*,
                dup.first_name as doctor_first_name,
                dup.last_name as doctor_last_name
         FROM lab_tests lt
         LEFT JOIN doctors d ON lt.ordered_by = d.id
         LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
         WHERE lt.patient_id = $1
         ORDER BY lt.ordered_date DESC
         LIMIT 10`,
        [patient.id]
      );
    } catch (error) {
      console.log('Lab tests table not found or error fetching lab tests');
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: patient,
        upcomingAppointments: appointmentsResult.rows,
        activePrescriptions: prescriptionsResult.rows,
        recentRecords: recordsResult.rows,
        labTests: labTestsResult.rows,
      }
    });

  } catch (error) {
    console.error('Patient dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 