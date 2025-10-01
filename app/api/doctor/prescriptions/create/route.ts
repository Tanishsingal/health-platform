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
    const { 
      patient_id, 
      chief_complaint,
      vital_signs,
      examination_findings,
      diagnosis,
      medications,
      diet_instructions,
      activity_instructions,
      follow_up_date,
      follow_up_instructions,
      general_instructions
    } = body;

    if (!patient_id || !medications || medications.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient ID and at least one medication required' },
        { status: 400 }
      );
    }

    if (!chief_complaint || !diagnosis) {
      return NextResponse.json(
        { success: false, error: 'Chief complaint and diagnosis are required' },
        { status: 400 }
      );
    }

    // Compile complete prescription instructions
    const compiledInstructions = {
      chief_complaint,
      vital_signs,
      examination_findings,
      diagnosis,
      diet_instructions,
      activity_instructions,
      follow_up_date,
      follow_up_instructions,
      general_instructions,
      medications_list: medications
    };

    const instructionsText = `
CHIEF COMPLAINT: ${chief_complaint}

VITAL SIGNS:
${vital_signs.bloodPressure ? `- Blood Pressure: ${vital_signs.bloodPressure} mmHg\n` : ''}${vital_signs.temperature ? `- Temperature: ${vital_signs.temperature}°F\n` : ''}${vital_signs.pulse ? `- Pulse: ${vital_signs.pulse} bpm\n` : ''}${vital_signs.respiratoryRate ? `- Respiratory Rate: ${vital_signs.respiratoryRate}\n` : ''}${vital_signs.oxygenSaturation ? `- Oxygen Saturation: ${vital_signs.oxygenSaturation}%\n` : ''}${vital_signs.weight ? `- Weight: ${vital_signs.weight} kg\n` : ''}

${examination_findings ? `EXAMINATION FINDINGS:\n${examination_findings}\n\n` : ''}DIAGNOSIS: ${diagnosis}

${diet_instructions ? `DIET:\n${diet_instructions}\n\n` : ''}${activity_instructions ? `ACTIVITY:\n${activity_instructions}\n\n` : ''}${general_instructions ? `GENERAL INSTRUCTIONS:\n${general_instructions}\n\n` : ''}${follow_up_date ? `FOLLOW-UP DATE: ${new Date(follow_up_date).toLocaleDateString()}\n` : ''}${follow_up_instructions ? `FOLLOW-UP INSTRUCTIONS:\n${follow_up_instructions}` : ''}
    `.trim();

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

    // Process each medication
    const createdPrescriptions = [];
    for (const med of medications) {
      // Parse duration to days (e.g., "7 days" -> 7, "2 weeks" -> 14)
      let durationDays = null;
      if (med.duration) {
        const match = med.duration.match(/(\d+)/);
        if (match) {
          durationDays = parseInt(match[1]);
          // If it mentions weeks, multiply by 7
          if (med.duration.toLowerCase().includes('week')) {
            durationDays *= 7;
          }
        }
      }

      const prescriptionResult = await query(
        `INSERT INTO prescriptions 
         (patient_id, doctor_id, dosage, frequency, duration_days, instructions, status, prescribed_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
         RETURNING *`,
        [
          patient_id,
          doctorId,
          `${med.medication_name} - ${med.dosage}`, // Store medication name with dosage
          med.frequency,
          durationDays,
          instructionsText // Store complete clinical information
        ]
      );

      createdPrescriptions.push(prescriptionResult.rows[0]);

      // Create notification for patient
      await query(
        `INSERT INTO notifications 
         (user_id, title, message, type, related_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          patientUserId,
          'New Prescription',
          `Your doctor has prescribed ${med.medication_name} (${med.dosage}). Please check your prescriptions for details.`,
          'prescription',
          prescriptionResult.rows[0].id
        ]
      );
    }

    return NextResponse.json({
      success: true,
      data: createdPrescriptions,
      message: `${createdPrescriptions.length} prescription(s) created successfully`
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
} 