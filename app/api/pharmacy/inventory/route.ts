import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const addInventorySchema = z.object({
  medicationId: z.string().uuid(),
  quantityAvailable: z.number().positive(),
  minimumStockLevel: z.number().positive(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  supplier: z.string().optional(),
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

    // Verify user is a pharmacist
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'pharmacist') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a pharmacist' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = addInventorySchema.parse(body);

    // Check if medication exists
    const medicationCheck = await query(
      'SELECT id, name FROM medications WHERE id = $1',
      [validatedData.medicationId]
    );

    if (medicationCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Medication not found' },
        { status: 404 }
      );
    }

    // Add inventory item
    const inventoryResult = await query(
      `INSERT INTO inventory (
        medication_id,
        quantity_available,
        minimum_stock_level,
        expiry_date,
        batch_number,
        supplier,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [
        validatedData.medicationId,
        validatedData.quantityAvailable,
        validatedData.minimumStockLevel,
        validatedData.expiryDate || null,
        validatedData.batchNumber || null,
        validatedData.supplier || null,
      ]
    );

    console.log(`✅ Inventory item added for medication ${medicationCheck.rows[0].name} by pharmacist ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        inventory: inventoryResult.rows[0],
        medication: medicationCheck.rows[0]
      },
      message: 'Inventory item added successfully'
    });

  } catch (error: any) {
    console.error('Add inventory error:', error);
    
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
      { success: false, error: 'Failed to add inventory', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Verify user is a pharmacist
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'pharmacist') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a pharmacist' },
        { status: 403 }
      );
    }

    // Get all inventory items
    const inventoryResult = await query(
      `SELECT 
        i.*,
        m.name as medication_name,
        m.category as medication_category,
        m.unit_price
       FROM inventory i
       JOIN medications m ON i.medication_id = m.id
       ORDER BY i.updated_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: {
        inventory: inventoryResult.rows
      }
    });

  } catch (error: any) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory', details: error.message },
      { status: 500 }
    );
  }
} 