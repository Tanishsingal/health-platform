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

    // Verify user is an admin
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || !['admin', 'super_admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not an admin' },
        { status: 403 }
      );
    }

    // Get total users count
    const totalUsersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE status = $1',
      ['active']
    );
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get total patients count
    const totalPatientsResult = await query(
      'SELECT COUNT(*) as count FROM patients'
    );
    const totalPatients = parseInt(totalPatientsResult.rows[0].count);

    // Get total staff count (doctors + nurses + lab technicians + pharmacists)
    const totalStaffResult = await query(
      `SELECT COUNT(*) as count FROM users 
       WHERE role IN ('doctor', 'nurse', 'lab_technician', 'pharmacist') 
       AND status = 'active'`
    );
    const totalStaff = parseInt(totalStaffResult.rows[0].count);

    // Get today's appointments count
    let todayAppointments = 0;
    try {
      const todayAppointmentsResult = await query(
        `SELECT COUNT(*) as count FROM appointments 
         WHERE DATE(appointment_date) = CURRENT_DATE`
      );
      todayAppointments = parseInt(todayAppointmentsResult.rows[0].count);
    } catch (error) {
      console.log('Appointments table not found or error fetching appointments');
    }

    // Get recent users (last 7 days)
    const recentUsersResult = await query(
      `SELECT u.id, u.role, u.created_at, up.first_name, up.last_name, up.phone
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.created_at >= NOW() - INTERVAL '7 days'
       AND u.status = 'active'
       ORDER BY u.created_at DESC
       LIMIT 10`
    );

    // Get all users for user management tab
    const allUsersResult = await query(
      `SELECT u.id, u.email, u.role, u.status, u.created_at, 
              up.first_name, up.last_name, up.phone
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.status = 'active'
       ORDER BY u.created_at DESC
       LIMIT 50`
    );

    // Get all doctors with their details
    const doctorsResult = await query(
      `SELECT d.id, d.specialization, d.department, d.license_number, 
              d.created_at,
              up.first_name, up.last_name, up.phone,
              u.email, u.role
       FROM doctors d
       INNER JOIN users u ON d.user_id = u.id
       LEFT JOIN user_profiles up ON d.user_id = up.user_id
       WHERE u.status = 'active'
       ORDER BY d.created_at DESC`
    );

    // Get all nurses
    const nursesResult = await query(
      `SELECT u.id, u.email, u.role, u.created_at,
              up.first_name, up.last_name, up.phone
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.role = 'nurse' AND u.status = 'active'
       ORDER BY u.created_at DESC`
    );

    // Get all lab technicians
    const labTechsResult = await query(
      `SELECT u.id, u.email, u.role, u.created_at,
              up.first_name, up.last_name, up.phone
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.role = 'lab_technician' AND u.status = 'active'
       ORDER BY u.created_at DESC`
    );

    // Get all pharmacists
    const pharmacistsResult = await query(
      `SELECT u.id, u.email, u.role, u.created_at,
              up.first_name, up.last_name, up.phone
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.role = 'pharmacist' AND u.status = 'active'
       ORDER BY u.created_at DESC`
    );

    // Combine all staff
    const allStaff = [
      ...doctorsResult.rows.map(d => ({
        id: d.id,
        first_name: d.first_name,
        last_name: d.last_name,
        role: 'doctor',
        email: d.email,
        phone: d.phone,
        specialization: d.specialization,
        department: d.department,
        license_number: d.license_number,
        created_at: d.created_at
      })),
      ...nursesResult.rows.map(n => ({
        id: n.id,
        first_name: n.first_name,
        last_name: n.last_name,
        role: n.role,
        email: n.email,
        phone: n.phone,
        created_at: n.created_at
      })),
      ...labTechsResult.rows.map(l => ({
        id: l.id,
        first_name: l.first_name,
        last_name: l.last_name,
        role: l.role,
        email: l.email,
        phone: l.phone,
        created_at: l.created_at
      })),
      ...pharmacistsResult.rows.map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        role: p.role,
        email: p.email,
        phone: p.phone,
        created_at: p.created_at
      }))
    ];

    // Sort all staff by created_at
    allStaff.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPatients,
          totalStaff,
          todayAppointments
        },
        recentUsers: recentUsersResult.rows,
        allUsers: allUsersResult.rows,
        allStaff: allStaff
      }
    });

  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 