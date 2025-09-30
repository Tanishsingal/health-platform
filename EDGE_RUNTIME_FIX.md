# 🔧 Edge Runtime Fix

## Problem
Next.js middleware runs on the **Edge Runtime**, which doesn't support Node.js-specific modules like:
- `crypto` (Node.js crypto module)
- `pg` (PostgreSQL native bindings)
- `jsonwebtoken` (uses Node.js crypto)

### Error Message
```
Error: The edge runtime does not support Node.js 'crypto' module.
```

## Solution

### 1. Replaced JWT Library
**Before:** Used `jsonwebtoken` (Node.js only)  
**After:** Using `jose` (Edge Runtime compatible)

```typescript
// Old (Node.js only)
import jwt from 'jsonwebtoken';
const token = jwt.sign(payload, secret);

// New (Edge compatible)
import { SignJWT, jwtVerify } from 'jose';
const token = await new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('7d')
  .sign(secret);
```

### 2. Updated Middleware
- Removed direct imports of `auth.ts` and `database.ts` (which import `pg`)
- Implemented JWT verification directly in middleware using `jose`
- Middleware now only handles token validation, not database queries

### 3. Updated Authentication Module
- Changed `generateToken()` and `verifyToken()` to async functions
- Using `jose` library instead of `jsonwebtoken`
- Updated all auth functions to await token generation

### 4. Next.js Configuration
Added webpack config to suppress `pg-native` warnings:

```javascript
// next.config.mjs
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push('pg-native');
  }
  config.ignoreWarnings = [
    { module: /node_modules\/pg\/lib\/native\/client\.js/ },
    { module: /node_modules\/pg\/lib\/native\/index\.js/ },
  ];
  return config;
}
```

## Changes Made

### Files Modified
1. **lib/middleware.ts** - Use `jose` instead of importing auth module
2. **lib/auth.ts** - Replace `jsonwebtoken` with `jose`
3. **next.config.mjs** - Add webpack configuration
4. **package.json** - Replace `jsonwebtoken` with `jose`

### Dependencies
- ✅ Added: `jose` (v6.1.0) - Edge Runtime compatible JWT
- ❌ Removed: `jsonwebtoken` - Node.js only
- ❌ Removed: `@types/jsonwebtoken`

## Key Differences: jose vs jsonwebtoken

| Feature | jsonwebtoken | jose |
|---------|-------------|------|
| Runtime | Node.js only | Universal (Node.js, Edge, Browser) |
| API | Synchronous | Asynchronous |
| Size | Larger | Smaller, tree-shakeable |
| Standards | JWT, JWE, JWS | Full JOSE suite |
| Edge Compatible | ❌ No | ✅ Yes |

## How It Works Now

### Middleware Flow
1. Request comes to protected route
2. Middleware checks for `auth-token` cookie
3. If found, verifies token using `jose.jwtVerify()`
4. Extracts user info from token payload
5. Adds user info to request headers
6. No database queries in middleware!

### Authentication Flow
1. User logs in via `/api/auth/login`
2. Server validates credentials against database
3. Generates JWT token using `jose.SignJWT()`
4. Sets HTTP-only cookie with token
5. Returns user info to client

### Benefits
- ✅ Edge Runtime compatible
- ✅ Faster cold starts
- ✅ Can deploy to Edge networks
- ✅ Better performance
- ✅ Modern, standards-compliant

## Testing

### Verify the Fix
1. Start server: `npm run dev`
2. Visit: http://localhost:3000
3. No Edge Runtime errors should appear
4. Middleware should work correctly

### Test Authentication
1. Visit: http://localhost:3000/api/health
2. Try accessing protected route: http://localhost:3000/dashboard
3. Should redirect to login
4. Login with test credentials
5. Should access dashboard successfully

## Important Notes

### JWT Secret Format
The JWT secret is now encoded as `Uint8Array`:

```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret'
);
```

This format is required by `jose` and works in both Node.js and Edge Runtime.

### Async Token Operations
All token operations are now async:

```typescript
// Must await token generation
const token = await generateToken({ userId, email, role });

// Must await token verification
const payload = await verifyToken(token);
```

### No Database in Middleware
The middleware NO LONGER:
- Connects to database
- Queries user information
- Validates against database

It ONLY:
- Verifies JWT token signature
- Checks token expiration
- Extracts payload information

## Troubleshooting

### If you still see Edge Runtime errors:
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Check that `jose` is installed: `npm list jose`

### If authentication doesn't work:
1. Check JWT_SECRET in `.env` file
2. Clear browser cookies
3. Try logging in again
4. Check server logs for errors

### If pg-native warnings persist:
These are safe to ignore - they're just warnings about optional native bindings that we don't use.

---

✅ **Fix Complete!** Your application now works with Next.js Edge Runtime while maintaining full authentication functionality. 