import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { z } from 'zod';

// =====================================================
// VALIDATION SCHEMA
// =====================================================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['patient', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'admin']),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

// =====================================================
// REGISTER API ROUTE
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = registerSchema.safeParse(body);
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

    const userData = validation.data;

    // Register new user
    const registerResult = await registerUser(userData);

    if (!registerResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: registerResult.error 
        },
        { status: 400 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: registerResult.user,
      message: 'Registration successful'
    }, { status: 201 });

    // Set authentication cookie in the response
    if (registerResult.token) {
      response.cookies.set('auth-token', registerResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 