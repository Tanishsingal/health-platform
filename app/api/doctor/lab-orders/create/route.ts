import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // Verify user is a doctor
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'doctor') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a doctor' },
        { status: 401 }
      );
    }

    // Get doctor ID
    const doctorResult = await query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor record not found' },
        { status: 404 }
      );
    }

    const doctorId = doctorResult.rows[0].id;

        const body = await request.json();
    const { patient_id, test_name, test_type, urgent, notes } = body;

    if (!patient_id || !test_name || !test_type) {
      return NextResponse.json(
        { success: false, error: 'Patient ID, test name, and test type are required' },
        { status: 400 }
      );
    }

    // Get patient's user_id for notification
    const patientUserResult = await query(
      'SELECT user_id FROM patients WHERE id = $1',
      [patient_id]
    );

    if (patientUserResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientUserId = patientUserResult.rows[0].user_id;

    // Insert lab test order
    const labOrderResult = await query(
      `INSERT INTO lab_tests
       (patient_id, ordered_by, test_name, test_type, status, notes, ordered_date, created_at)
       VALUES ($1, $2, $3, $4, 'ordered', $5, NOW(), NOW())
       RETURNING *`,
      [patient_id, doctorId, test_name, test_type, notes || '']
    );

    // Create notification for patient
    await query(
      `INSERT INTO notifications 
       (user_id, title, message, type, related_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        patientUserId,
        'New Lab Test Order',
        `Your doctor has ordered a lab test: ${test_name}. Please visit the lab for sample collection.`,
        'lab_test',
        labOrderResult.rows[0].id
      ]
    );

    return NextResponse.json({
      success: true,
      data: labOrderResult.rows[0],
      message: 'Lab test order created successfully'
    });

  } catch (error) {
    console.error('Create lab order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lab order' },
      { status: 500 }
    );
  }
} 