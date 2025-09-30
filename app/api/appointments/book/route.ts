import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for appointment booking
const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentDate: z.string(), // ISO date string
  reason: z.string().min(1, 'Reason is required'),
  duration: z.number().optional().default(30),
});

export async function POST(request: NextRequest) {
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
      'SELECT id FROM patients WHERE user_id = $1',
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient record not found' },
        { status: 404 }
      );
    }

    const patientId = patientResult.rows[0].id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = bookAppointmentSchema.parse(body);

    // Verify doctor exists
    const doctorResult = await query(
      'SELECT id FROM doctors WHERE id = $1',
      [validatedData.doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check for conflicting appointments
    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 
       AND appointment_date = $2 
       AND status NOT IN ('cancelled', 'completed')`,
      [validatedData.doctorId, validatedData.appointmentDate]
    );

    if (conflictCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Create appointment
    const appointmentResult = await query(
      `INSERT INTO appointments (
        patient_id, 
        doctor_id, 
        appointment_date, 
        duration_minutes, 
        reason, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        patientId,
        validatedData.doctorId,
        validatedData.appointmentDate,
        validatedData.duration,
        validatedData.reason,
        'scheduled'
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        appointment: appointmentResult.rows[0]
      },
      message: 'Appointment booked successfully'
    });

  } catch (error: any) {
    console.error('Appointment booking error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to book appointment',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 