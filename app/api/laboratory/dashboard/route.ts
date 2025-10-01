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

    // Fetch lab tests with patient and doctor details
    const labTestsResult = await query(
      `SELECT 
         lt.*,
         p.id as patient_id,
         up_patient.first_name as patient_first_name,
         up_patient.last_name as patient_last_name,
         d.id as doctor_id,
         up_doctor.first_name as doctor_first_name,
         up_doctor.last_name as doctor_last_name
       FROM lab_tests lt
       INNER JOIN patients p ON lt.patient_id = p.id
       INNER JOIN user_profiles up_patient ON p.user_id = up_patient.user_id
       INNER JOIN doctors d ON lt.ordered_by = d.id
       INNER JOIN user_profiles up_doctor ON d.user_id = up_doctor.user_id
       ORDER BY 
         CASE 
           WHEN lt.status = 'ordered' THEN 1
           WHEN lt.status = 'in_progress' THEN 2
           WHEN lt.status = 'completed' THEN 3
           ELSE 4
         END,
         lt.ordered_date DESC
       LIMIT 100`
    );

    // Categorize tests by status
    const tests = labTestsResult.rows.map(row => ({
      id: row.id,
      patient_id: row.patient_id,
      patient_name: `${row.patient_first_name} ${row.patient_last_name}`,
      test_name: row.test_name,
      test_type: row.test_type,
      status: row.status,
      notes: row.notes,
      ordered_date: row.ordered_date,
      sample_collected_date: row.sample_collected_date,
      completed_date: row.completed_date,
      results: row.results,
      doctor_name: `Dr. ${row.doctor_first_name} ${row.doctor_last_name}`
    }));

    const pendingTests = tests.filter(t => t.status === 'ordered');
    const inProgressTests = tests.filter(t => t.status === 'in_progress' || t.status === 'sample_collected');
    const completedTests = tests.filter(t => t.status === 'completed');

    // Get stats
    const stats = {
      pending: pendingTests.length,
      inProgress: inProgressTests.length,
      completedToday: completedTests.filter(t => {
        if (!t.completed_date) return false;
        const today = new Date();
        const completedDate = new Date(t.completed_date);
        return completedDate.toDateString() === today.toDateString();
      }).length,
      total: tests.length
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        pendingTests,
        inProgressTests,
        completedTests,
        allTests: tests
      }
    });

  } catch (error) {
    console.error('Get laboratory dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch laboratory data' },
      { status: 500 }
    );
  }
} 