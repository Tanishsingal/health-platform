import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// PUT - Update lab test status or results
export async function PUT(
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
    const testId = params.id;

    // Verify user is a lab technician
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'lab_technician') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a lab technician' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, results, notes, sample_collected_date } = body;

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (results !== undefined) {
      updateFields.push(`results = $${paramCount}`);
      values.push(JSON.stringify(results));
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (sample_collected_date) {
      updateFields.push(`sample_collected_date = $${paramCount}`);
      values.push(sample_collected_date);
      paramCount++;
    }

    // Set completed_date if status is completed
    if (status === 'completed') {
      updateFields.push(`completed_date = NOW()`);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(testId);

    const updateQuery = `
      UPDATE lab_tests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lab test not found' },
        { status: 404 }
      );
    }

    const updatedTest = result.rows[0];

    // If test is completed, create notification for patient
    if (status === 'completed') {
      try {
        // Get patient's user_id
        const patientResult = await query(
          'SELECT user_id FROM patients WHERE id = $1',
          [updatedTest.patient_id]
        );

        if (patientResult.rows.length > 0) {
          const patientUserId = patientResult.rows[0].user_id;

          // Create notification
          await query(
            `INSERT INTO notifications 
             (user_id, title, message, type, related_id, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              patientUserId,
              'Lab Test Results Ready',
              `Your ${updatedTest.test_name} results are now available. Click to view your test results.`,
              'lab_test',
              updatedTest.id
            ]
          );
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedTest,
      message: 'Lab test updated successfully'
    });

  } catch (error) {
    console.error('Update lab test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lab test' },
      { status: 500 }
    );
  }
} 