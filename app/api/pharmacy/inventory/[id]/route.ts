import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateInventorySchema = z.object({
  quantityAvailable: z.number().positive().optional(),
  minimumStockLevel: z.number().positive().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  supplier: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const inventoryId = params.id;

    // Get inventory item details
    const inventoryResult = await query(
      `SELECT 
        i.*,
        m.name as medication_name,
        m.category as medication_category,
        m.unit_price,
        m.description as medication_description
       FROM inventory i
       JOIN medications m ON i.medication_id = m.id
       WHERE i.id = $1`,
      [inventoryId]
    );

    if (inventoryResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        inventory: inventoryResult.rows[0]
      }
    });

  } catch (error: any) {
    console.error('Get inventory item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory item', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const inventoryId = params.id;
    const body = await request.json();
    const validatedData = updateInventorySchema.parse(body);

    // Check if inventory item exists
    const inventoryCheck = await query(
      'SELECT id FROM inventory WHERE id = $1',
      [inventoryId]
    );

    if (inventoryCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validatedData.quantityAvailable !== undefined) {
      updates.push(`quantity_available = $${paramIndex++}`);
      values.push(validatedData.quantityAvailable);
    }

    if (validatedData.minimumStockLevel !== undefined) {
      updates.push(`minimum_stock_level = $${paramIndex++}`);
      values.push(validatedData.minimumStockLevel);
    }

    if (validatedData.expiryDate !== undefined) {
      updates.push(`expiry_date = $${paramIndex++}`);
      values.push(validatedData.expiryDate);
    }

    if (validatedData.batchNumber !== undefined) {
      updates.push(`batch_number = $${paramIndex++}`);
      values.push(validatedData.batchNumber);
    }

    if (validatedData.supplier !== undefined) {
      updates.push(`supplier = $${paramIndex++}`);
      values.push(validatedData.supplier);
    }

    updates.push(`updated_at = NOW()`);
    values.push(inventoryId);

    const updateQuery = `
      UPDATE inventory 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await query(updateQuery, values);

    console.log(`✅ Inventory item ${inventoryId} updated by pharmacist ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        inventory: updateResult.rows[0]
      },
      message: 'Inventory updated successfully'
    });

  } catch (error: any) {
    console.error('Update inventory error:', error);
    
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
      { success: false, error: 'Failed to update inventory', details: error.message },
      { status: 500 }
    );
  }
} 