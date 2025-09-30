# 🔄 Migration from Supabase to Custom API & Database

This document outlines the complete migration from Supabase to a custom PostgreSQL database with our own API implementation.

## 📋 What Changed

### ✅ Removed
- `@supabase/supabase-js` dependency
- `@supabase/ssr` dependency
- Supabase client configuration
- Supabase authentication flows

### ✅ Added
- Custom PostgreSQL database connection (`lib/database.ts`)
- JWT-based authentication system (`lib/auth.ts`)
- Custom API routes (`app/api/`)
- Database migration system (`scripts/migrate.js`)
- Database seeding system (`scripts/seed.js`)
- Enhanced middleware with role-based access control

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the environment template:
```bash
cp env.example .env
```

Update `.env` with your configuration:
```env
# Neon Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_TfCLG5ti0ean@ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Set Up Database

#### Using Neon DB (Serverless PostgreSQL)
Your project is now configured to use Neon DB - a serverless PostgreSQL database.

```bash
# Test your Neon connection
npm run db:test

# Set up the database structure
npm run db:setup
```

### 4. Run Migrations and Seed Data

```bash
# Run database migrations
npm run db:migrate

# Seed with initial data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

## 🔐 Authentication System

### JWT-Based Authentication
- Secure JWT tokens with configurable expiration
- HTTP-only cookies for token storage
- Automatic token refresh
- Role-based access control

### Default Login Credentials
After seeding, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@hospital.com | password123 |
| Doctor | doctor@hospital.com | password123 |
| Nurse | nurse@hospital.com | password123 |
| Patient | patient@hospital.com | password123 |
| Pharmacist | pharmacist@hospital.com | password123 |

⚠️ **Change these passwords in production!**

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Health Check
- `GET /api/health` - System health check

## 🗄 Database Schema

The system uses a comprehensive PostgreSQL schema with:

- **Users & Profiles** - User management with roles
- **Patients** - Patient records and medical history
- **Doctors** - Doctor profiles and specializations
- **Medications** - Drug database with inventory
- **Lab Tests** - Laboratory test types and results
- **Appointments** - Scheduling system
- **Prescriptions** - Medication prescriptions
- **And more...**

## 🔒 Security Features

### Authentication Security
- Bcrypt password hashing (12 rounds)
- JWT tokens with secure secrets
- HTTP-only cookies
- Automatic token expiration
- Failed login attempt tracking

### API Security
- Input validation with Zod schemas
- SQL injection protection with parameterized queries
- Rate limiting ready (can be added)
- CORS configuration
- Security headers in middleware

### Database Security
- Row Level Security (RLS) policies
- Connection pooling
- Transaction support
- Prepared statements

## 🚦 Middleware & Route Protection

### Route Protection
Protected routes automatically redirect unauthenticated users to login:
- `/dashboard/*`
- `/patient/*`
- `/doctor/*`
- `/admin/*`
- `/pharmacy/*`
- `/laboratory/*`
- `/analytics/*`

### Role-Based Access Control
Different routes require different roles:
- **Admin routes** - Super admin, admin only
- **Doctor routes** - Super admin, admin, doctor
- **Patient routes** - All authenticated users
- **Pharmacy routes** - Super admin, admin, pharmacist
- **Lab routes** - Super admin, admin, lab technician

## 📊 Database Operations

### Direct Database Queries
```typescript
import { query } from '@/lib/database';

// Simple query
const users = await query('SELECT * FROM users WHERE role = $1', ['doctor']);

// With transaction
import { withTransaction } from '@/lib/database';

await withTransaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO user_profiles ...');
});
```

### Using Server Client (Supabase-like API)
```typescript
import { createClient } from '@/lib/server';

const client = await createClient();

// Get current user
const { data: { user } } = await client.auth.getUser();

// Database operations
const { data, error } = await client.from('users').select('*');
```

## 🔧 Development Scripts

```bash
# Test Neon database connection
npm run db:test

# Database setup (Neon DB instructions)
npm run db:setup

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## 📁 Project Structure

```
lib/
├── auth.ts          # JWT authentication system
├── database.ts      # PostgreSQL connection & queries
├── middleware.ts    # Route protection & security
├── client.ts        # Client-side API wrapper
├── server.ts        # Server-side utilities
└── types/           # TypeScript type definitions

app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
└── health/route.ts

scripts/
├── setup-db.js      # Database setup with Docker
├── migrate.js       # Database migration system
└── seed.js          # Database seeding
```

## 🔄 Migration Checklist

- [x] Remove Supabase dependencies
- [x] Set up PostgreSQL database connection
- [x] Implement JWT authentication
- [x] Create API routes for auth
- [x] Update middleware for route protection
- [x] Create database migration system
- [x] Create database seeding system
- [x] Update client libraries
- [x] Add comprehensive error handling
- [x] Add security headers and validation
- [x] Create environment configuration
- [x] Add health check endpoint
- [x] Document the migration process

## 🚀 Production Deployment

### Environment Variables
Ensure these are set in production:
- `JWT_SECRET` - Use a strong, random secret
- `DB_*` - Production database credentials
- `NODE_ENV=production`

### Database Setup
1. Set up PostgreSQL instance
2. Run migrations: `npm run db:migrate`
3. Optionally seed data: `npm run db:seed`

### Security Considerations
- Use strong JWT secrets
- Enable SSL for database connections
- Set up proper CORS policies
- Implement rate limiting
- Use HTTPS in production
- Regular security updates

## 🆘 Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check connection credentials in `.env`
3. Ensure database exists and user has permissions

### Authentication Issues
1. Check JWT_SECRET is set
2. Verify cookies are being set correctly
3. Check token expiration settings

### Migration Issues
1. Ensure database schema is up to date
2. Check migration logs for errors
3. Verify all required tables exist

## 📞 Support

If you encounter issues during migration:
1. Check the logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Review the migration scripts for any custom modifications needed

---

🎉 **Migration Complete!** Your healthcare platform now runs on a custom API with PostgreSQL, providing better control, security, and scalability. 