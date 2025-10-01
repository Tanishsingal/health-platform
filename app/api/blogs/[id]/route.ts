import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// GET - Fetch a single blog by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Try to fetch by ID or slug
    // Cast UUID to text to allow comparison with slug string
    // Admin sees all blogs, public sees only published
    const blogResult = isAdmin
      ? await query(
          `SELECT b.*, up.first_name, up.last_name
           FROM blogs b
           LEFT JOIN user_profiles up ON b.author_id = up.user_id
           WHERE b.id::text = $1 OR b.slug = $1`,
          [params.id]
        )
      : await query(
          `SELECT b.*, up.first_name, up.last_name
           FROM blogs b
           LEFT JOIN user_profiles up ON b.author_id = up.user_id
           WHERE (b.id::text = $1 OR b.slug = $1) AND b.status = 'published'`,
          [params.id]
        );

    if (blogResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog not found or not published' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blogResult.rows[0]
    });

  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a blog (admin only)
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

    // Check if slug is being changed and if it already exists
    if (slug) {
      const slugCheck = await query(
        'SELECT id FROM blogs WHERE slug = $1 AND id != $2',
        [slug, params.id]
      );

      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Get current blog status
    const currentBlog = await query(
      'SELECT status, published_at FROM blogs WHERE id = $1',
      [params.id]
    );

    if (currentBlog.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Update published_at if status is changing to published
    let published_at = currentBlog.rows[0].published_at;
    if (status === 'published' && currentBlog.rows[0].status !== 'published') {
      published_at = new Date();
    }

    const result = await query(
      `UPDATE blogs
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           excerpt = COALESCE($3, excerpt),
           content = COALESCE($4, content),
           category = COALESCE($5, category),
           tags = COALESCE($6, tags),
           featured_image = COALESCE($7, featured_image),
           status = COALESCE($8, status),
           published_at = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, slug, excerpt, content, category, tags, featured_image, status, published_at, params.id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Blog updated successfully'
    });

  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog (admin only)
export async function DELETE(
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

    const result = await query(
      'DELETE FROM blogs WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 