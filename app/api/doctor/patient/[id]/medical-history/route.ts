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
        { success: false, error: 'Unauthorized - Not authorized to view patient records' },
        { status: 401 }
      );
    }

    // Get patient medical history documents
    const documentsResult = await query(
      `SELECT pd.*, p.medical_record_number, up.first_name, up.last_name
       FROM patient_documents pd
       INNER JOIN patients p ON pd.patient_id = p.id
       INNER JOIN user_profiles up ON p.user_id = up.user_id
       WHERE p.id = $1
       ORDER BY pd.document_date DESC NULLS LAST, pd.uploaded_at DESC`,
      [patientId]
    );

    // Get patient medical records
    const medicalRecordsResult = await query(
      `SELECT mr.*, d.specialization,
              dup.first_name as doctor_first_name,
              dup.last_name as doctor_last_name
       FROM medical_records mr
       LEFT JOIN doctors d ON mr.doctor_id = d.id
       LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
       WHERE mr.patient_id = $1
       ORDER BY mr.visit_date DESC
       LIMIT 10`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      data: {
        documents: documentsResult.rows,
        medicalRecords: medicalRecordsResult.rows
      }
    });

  } catch (error) {
    console.error('Get patient medical history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 