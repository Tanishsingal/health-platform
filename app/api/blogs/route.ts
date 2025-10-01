import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all published blogs (public) or all blogs (admin)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    let isAdmin = false;

    // Check if user is admin
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const userResult = await query(
          'SELECT role FROM users WHERE id = $1',
          [payload.userId]
        );
        if (userResult.rows.length > 0 && ['admin', 'super_admin'].includes(userResult.rows[0].role)) {
          isAdmin = true;
        }
      }
    }

    // Admin sees all blogs, public sees only published
    const blogsResult = isAdmin
      ? await query(
          `SELECT b.*, up.first_name, up.last_name
           FROM blogs b
           LEFT JOIN user_profiles up ON b.author_id = up.user_id
           ORDER BY b.created_at DESC`
        )
      : await query(
          `SELECT b.*, up.first_name, up.last_name
           FROM blogs b
           LEFT JOIN user_profiles up ON b.author_id = up.user_id
           WHERE b.status = 'published'
           ORDER BY b.published_at DESC`
        );

    return NextResponse.json({
      success: true,
      data: blogsResult.rows
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog (admin only)
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

    // Verify user is admin
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [payload.userId]
    );

    if (userResult.rows.length === 0 || !['admin', 'super_admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, category, tags, featured_image, status } = body;

    // Validate required fields
    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const slugCheck = await query(
      'SELECT id FROM blogs WHERE slug = $1',
      [slug]
    );

    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const published_at = status === 'published' ? new Date() : null;

    const result = await query(
      `INSERT INTO blogs
       (title, slug, excerpt, content, author_id, category, tags, featured_image, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, slug, excerpt, content, payload.userId, category, tags || [], featured_image || null, status || 'draft', published_at]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Blog created successfully'
    });

  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 