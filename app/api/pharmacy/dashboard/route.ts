import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user info from auth token
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

    // Verify user is a pharmacist
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'pharmacist') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a pharmacist' },
        { status: 401 }
      );
    }

    // Get user profile
    const profileResult = await query(
      `SELECT first_name, last_name FROM user_profiles WHERE user_id = $1`,
      [userId]
    );

    const profile = profileResult.rows[0] || { first_name: 'Pharmacist', last_name: '' };

    // Get pending prescriptions with patient and doctor info
    const pendingPrescriptionsResult = await query(
      `SELECT 
        pr.id,
        pr.dosage,
        pr.frequency,
        pr.status,
        pr.created_at,
        m.name as medication_name,
        m.category,
        pup.first_name as patient_first_name,
        pup.last_name as patient_last_name,
        dup.first_name as doctor_first_name,
        dup.last_name as doctor_last_name
       FROM prescriptions pr
       LEFT JOIN medications m ON pr.medication_id = m.id
       LEFT JOIN patients p ON pr.patient_id = p.id
       LEFT JOIN user_profiles pup ON p.user_id = pup.user_id
       LEFT JOIN doctors d ON pr.doctor_id = d.id
       LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
       WHERE pr.status = 'pending'
       ORDER BY pr.created_at DESC
       LIMIT 10`
    );

    // Get low stock items from inventory
    const lowStockItemsResult = await query(
      `SELECT 
        i.id,
        m.name as item_name,
        m.category as item_type,
        i.quantity_available as current_stock,
        i.minimum_stock_level as minimum_stock
       FROM inventory i
       JOIN medications m ON i.medication_id = m.id
       WHERE i.quantity_available <= i.minimum_stock_level
       ORDER BY (i.quantity_available::float / NULLIF(i.minimum_stock_level, 0)) ASC
       LIMIT 10`
    );

    // Get expiring items (expiring in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItemsResult = await query(
      `SELECT 
        i.id,
        m.name as item_name,
        i.quantity_available as current_stock,
        i.expiry_date
       FROM inventory i
       JOIN medications m ON i.medication_id = m.id
       WHERE i.expiry_date <= $1
       AND i.expiry_date >= CURRENT_DATE
       ORDER BY i.expiry_date ASC
       LIMIT 10`,
      [thirtyDaysFromNow.toISOString().split('T')[0]]
    );

    // Get recent inventory updates
    const recentInventoryResult = await query(
      `SELECT 
        i.id,
        m.name as item_name,
        m.category as item_type,
        i.quantity_available as current_stock,
        m.unit_price,
        i.updated_at
       FROM inventory i
       JOIN medications m ON i.medication_id = m.id
       ORDER BY i.updated_at DESC
       LIMIT 10`
    );

    // Get stats
    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM prescriptions WHERE status = 'pending') as pending_prescriptions,
        (SELECT COUNT(*) FROM inventory WHERE quantity_available <= minimum_stock_level) as low_stock_count,
        (SELECT COUNT(*) FROM inventory WHERE expiry_date <= $1 AND expiry_date >= CURRENT_DATE) as expiring_count,
        (SELECT COUNT(*) FROM prescriptions WHERE status = 'filled' AND DATE(updated_at) = CURRENT_DATE) as filled_today`,
      [thirtyDaysFromNow.toISOString().split('T')[0]]
    );

    const stats = statsResult.rows[0] || {
      pending_prescriptions: 0,
      low_stock_count: 0,
      expiring_count: 0,
      filled_today: 0
    };

    console.log('📊 Pharmacy dashboard stats:', stats);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        pendingPrescriptions: pendingPrescriptionsResult.rows,
        lowStockItems: lowStockItemsResult.rows,
        expiringItems: expiringItemsResult.rows,
        recentInventory: recentInventoryResult.rows,
        stats: {
          pendingPrescriptions: parseInt(stats.pending_prescriptions),
          lowStockCount: parseInt(stats.low_stock_count),
          expiringCount: parseInt(stats.expiring_count),
          filledToday: parseInt(stats.filled_today)
        }
      }
    });

  } catch (error) {
    console.error('Pharmacy dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 