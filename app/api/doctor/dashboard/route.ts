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

    // Verify user is a doctor
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'doctor') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a doctor' },
        { status: 401 }
      );
    }

    // Get doctor record
    const doctorResult = await query(
      `SELECT d.*, up.first_name, up.last_name, up.phone
       FROM doctors d
       LEFT JOIN user_profiles up ON d.user_id = up.user_id
       WHERE d.user_id = $1`,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor record not found' },
        { status: 404 }
      );
    }

    const doctor = doctorResult.rows[0];

    // Get today's appointments (using Indian Standard Time - IST)
    const now = new Date();
    
    // Convert to IST (UTC+5:30)
    const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const nowIST = new Date(now.getTime() + ISTOffset);
    
    const todayStart = new Date(nowIST);
    todayStart.setUTCHours(0, 0, 0, 0);
    
    const todayEnd = new Date(nowIST);
    todayEnd.setUTCHours(23, 59, 59, 999);
    
    console.log('🕐 IST Time Range:', {
      now: nowIST.toISOString(),
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString()
    });

    const todayAppointmentsResult = await query(
      `SELECT a.*, 
              p.medical_record_number,
              pup.first_name as patient_first_name,
              pup.last_name as patient_last_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN user_profiles pup ON p.user_id = pup.user_id
       WHERE a.doctor_id = $1 
       AND a.appointment_date >= $2
       AND a.appointment_date <= $3
       AND a.status IN ('scheduled', 'confirmed', 'completed')
       ORDER BY a.appointment_date ASC`,
      [doctor.id, todayStart.toISOString(), todayEnd.toISOString()]
    );
    
    console.log(`📅 Fetched ${todayAppointmentsResult.rows.length} today's appointments for doctor ${doctor.id}`);

    // Get upcoming appointments (all future appointments, excluding today)
    // Start from tomorrow 00:00:00 IST
    const tomorrowIST = new Date(nowIST);
    tomorrowIST.setUTCDate(tomorrowIST.getUTCDate() + 1);
    tomorrowIST.setUTCHours(0, 0, 0, 0);
    
    // Convert back to UTC for database query
    const tomorrowUTC = new Date(tomorrowIST.getTime() - ISTOffset);
    
    console.log('📅 Upcoming appointments range:', {
      tomorrowIST: tomorrowIST.toISOString(),
      tomorrowUTC: tomorrowUTC.toISOString()
    });

    const upcomingAppointmentsResult = await query(
      `SELECT a.*, 
              p.medical_record_number,
              pup.first_name as patient_first_name,
              pup.last_name as patient_last_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN user_profiles pup ON p.user_id = pup.user_id
       WHERE a.doctor_id = $1 
       AND a.appointment_date >= $2
       AND a.status IN ('scheduled', 'confirmed')
       ORDER BY a.appointment_date ASC
       LIMIT 10`,
      [doctor.id, tomorrowUTC.toISOString()]
    );
    
    console.log(`📅 Fetched ${upcomingAppointmentsResult.rows.length} upcoming appointments for doctor ${doctor.id}`);

    // Get recent patients (last 10 patients with medical records)
    const recentPatientsResult = await query(
      `SELECT DISTINCT ON (p.id)
              p.id,
              p.medical_record_number,
              pup.first_name,
              pup.last_name,
              pup.gender,
              mr.visit_date,
              mr.diagnosis,
              mr.created_at
       FROM medical_records mr
       LEFT JOIN patients p ON mr.patient_id = p.id
       LEFT JOIN user_profiles pup ON p.user_id = pup.user_id
       WHERE mr.doctor_id = $1
       ORDER BY p.id, mr.visit_date DESC
       LIMIT 10`,
      [doctor.id]
    );

    // Get stats
    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date >= $2 AND appointment_date <= $3) as today_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date > $3) as upcoming_appointments,
        (SELECT COUNT(DISTINCT patient_id) FROM medical_records WHERE doctor_id = $1) as total_patients,
        (SELECT COUNT(*) FROM medical_records WHERE doctor_id = $1 AND visit_date >= CURRENT_DATE - INTERVAL '30 days') as recent_visits`,
      [doctor.id, todayStart.toISOString(), todayEnd.toISOString()]
    );

    const stats = statsResult.rows[0] || {
      today_appointments: 0,
      upcoming_appointments: 0,
      total_patients: 0,
      recent_visits: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        profile: doctor,
        todayAppointments: todayAppointmentsResult.rows,
        upcomingAppointments: upcomingAppointmentsResult.rows,
        recentPatients: recentPatientsResult.rows,
        stats: {
          todayAppointments: parseInt(stats.today_appointments),
          upcomingAppointments: parseInt(stats.upcoming_appointments),
          totalPatients: parseInt(stats.total_patients),
          recentVisits: parseInt(stats.recent_visits)
        }
      }
    });

  } catch (error) {
    console.error('Doctor dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 