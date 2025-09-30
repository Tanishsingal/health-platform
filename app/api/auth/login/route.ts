import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { z } from 'zod';

// =====================================================
// VALIDATION SCHEMA
// =====================================================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// =====================================================
// LOGIN API ROUTE
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Authenticate user
    const authResult = await authenticateUser(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: 401 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      message: 'Login successful'
    });

    // Set authentication cookie in the response
    if (authResult.token) {
      response.cookies.set('auth-token', authResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 