import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// GET - Fetch notifications for current user
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

    // Get unread count
    const unreadCountResult = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    // Get all notifications (limit to recent 50)
    const notificationsResult = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications: notificationsResult.rows,
        unreadCount: parseInt(unreadCountResult.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PUT - Mark notification(s) as read
export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read
      await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Mark specific notification as read
      await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE id = $1 AND user_id = $2`,
        [notificationId, userId]
      );

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Either notificationId or markAllAsRead is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
} 