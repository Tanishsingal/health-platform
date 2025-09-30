// =====================================================
// AUTHENTICATION MODULE
// JWT token management and password hashing
// =====================================================

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query } from './database';

// =====================================================
// CONFIGURATION
// =====================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12;

// =====================================================
// TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'nurse' | 'patient' | 'pharmacist' | 'lab_technician';
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: User['role'];
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  success: boolean;
  user?: User & { profile?: UserProfile };
  token?: string;
  error?: string;
}

// =====================================================
// PASSWORD UTILITIES
// =====================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// =====================================================
// JWT UTILITIES
// =====================================================

export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
  
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// =====================================================
// COOKIE UTILITIES
// =====================================================

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth-token');
  return authCookie?.value || null;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// =====================================================
// USER AUTHENTICATION
// =====================================================

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Get user with password hash
    const userResult = await query<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    if (userResult.rows.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Get user profile
    const profileResult = await query<UserProfile>(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      user: {
        ...userWithoutPassword,
        profile: profileResult.rows[0] || undefined,
      },
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// =====================================================
// USER REGISTRATION
// =====================================================

interface RegisterUserData {
  email: string;
  password: string;
  role: User['role'];
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
}

export async function registerUser(userData: RegisterUserData): Promise<AuthResult> {
  try {
    const { email, password, role, firstName, lastName, phoneNumber, dateOfBirth, gender, address, emergencyContact } = userData;
    
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userResult = await query<User>(
      `INSERT INTO users (email, password_hash, role, status, email_verified) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [email, passwordHash, role, 'active', false]
    );

    const user = userResult.rows[0];

    // Create user profile
    const profileResult = await query<UserProfile>(
      `INSERT INTO user_profiles (user_id, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        user.id,
        firstName || '',
        lastName || '',
        phoneNumber || null,
        dateOfBirth || null,
        gender || null,
        address || null,
        emergencyContact || null,
      ]
    );

    // Create role-specific records
    if (role === 'doctor') {
      // Auto-generate doctor record
      await query(
        `INSERT INTO doctors (user_id, specialization, license_number, department) 
         VALUES ($1, $2, $3, $4)`,
        [user.id, 'General Practice', `MD-${Date.now()}`, 'Medical']
      );
    } else if (role === 'patient') {
      // Auto-generate patient record
      await query(
        `INSERT INTO patients (user_id, patient_id) 
         VALUES ($1, $2)`,
        [user.id, `PAT-${Date.now()}`]
      );
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      user: {
        ...user,
        profile: profileResult.rows[0],
      },
      token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

// =====================================================
// CURRENT USER
// =====================================================

export async function getCurrentUser(): Promise<User & { profile?: UserProfile } | null> {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get current user data
    const userResult = await query<User>(
      'SELECT * FROM users WHERE id = $1 AND status = $2',
      [payload.userId, 'active']
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get user profile
    const profileResult = await query<UserProfile>(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [user.id]
    );

    return {
      ...user,
      profile: profileResult.rows[0] || undefined,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// =====================================================
// AUTHORIZATION HELPERS
// =====================================================

export function hasRole(user: User | null, allowedRoles: User['role'][]): boolean {
  return user ? allowedRoles.includes(user.role) : false;
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['super_admin', 'admin']);
}

export function isDoctor(user: User | null): boolean {
  return hasRole(user, ['doctor']);
}

export function isPatient(user: User | null): boolean {
  return hasRole(user, ['patient']);
}

export function canAccessPatientData(user: User | null, patientId?: string): boolean {
  if (!user) return false;
  
  // Admins and doctors can access all patient data
  if (hasRole(user, ['super_admin', 'admin', 'doctor', 'nurse'])) {
    return true;
  }
  
  // Patients can only access their own data
  if (user.role === 'patient' && patientId) {
    // TODO: Check if user.id matches the patient record
    return true;
  }
  
  return false;
} 