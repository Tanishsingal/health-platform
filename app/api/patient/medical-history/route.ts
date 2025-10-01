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

    // Get patient ID
    const patientResult = await query(
      'SELECT id FROM patients WHERE user_id = $1',
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientId = patientResult.rows[0].id;

    // Get medical history documents
    const documentsResult = await query(
      `SELECT * FROM patient_documents 
       WHERE patient_id = $1 
       ORDER BY document_date DESC NULLS LAST, uploaded_at DESC`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      data: documentsResult.rows
    });

  } catch (error) {
    console.error('Get medical history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get patient ID
    const patientResult = await query(
      'SELECT id FROM patients WHERE user_id = $1',
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientId = patientResult.rows[0].id;

    const body = await request.json();
    const { document_type, document_name, document_date, document_data, file_type, notes } = body;

    // Insert document record
    const result = await query(
      `INSERT INTO patient_documents 
       (patient_id, document_type, document_name, document_date, document_data, file_type, notes, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [patientId, document_type, document_name, document_date, document_data, file_type, notes]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID required' },
        { status: 400 }
      );
    }

    // Get patient ID
    const patientResult = await query(
      'SELECT id FROM patients WHERE user_id = $1',
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientId = patientResult.rows[0].id;

    // Delete document (only if it belongs to the patient)
    await query(
      `DELETE FROM patient_documents 
       WHERE id = $1 AND patient_id = $2`,
      [documentId, patientId]
    );

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 