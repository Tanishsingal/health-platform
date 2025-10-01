// Healthcare Platform Server Utilities
// Server-side utilities for database operations and authentication

import { getCurrentUser as getAuthUser, clearAuthCookie } from './auth';
import { query } from './database';

/**
 * Server-side client for healthcare platform
 * Handles authentication and database operations on the server
 */
export async function createClient() {
  return {
    // Authentication helpers
    auth: {
      getUser: async () => {
        try {
          const user = await getAuthUser();
          return { data: { user }, error: null };
        } catch (error) {
          console.error('Get user error:', error);
          return { data: { user: null }, error: 'Failed to get user' };
        }
      },
      
      signOut: async () => {
        try {
          await clearAuthCookie();
          return { error: null };
        } catch (error) {
          console.error('Sign out error:', error);
          return { error: 'Failed to sign out' };
        }
      }
    },

    // Database query helpers
    from: (table: string) => ({
      select: async (columns = '*') => {
        try {
          const result = await query(`SELECT ${columns} FROM ${table}`);
          return { data: result.rows, error: null };
        } catch (error) {
          console.error('Database select error:', error);
          return { data: null, error: 'Database query failed' };
        }
      },

      insert: async (data: Record<string, any>) => {
        try {
          const columns = Object.keys(data).join(', ');
          const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(data);
          
          const result = await query(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
            values
          );
          
          return { data: result.rows[0], error: null };
        } catch (error) {
          console.error('Database insert error:', error);
          return { data: null, error: 'Database insert failed' };
        }
      },

      update: async (data: Record<string, any>, condition: { column: string; value: any }) => {
        try {
          const setClause = Object.keys(data)
            .map((key, i) => `${key} = $${i + 1}`)
            .join(', ');
          const values = [...Object.values(data), condition.value];
          
          const result = await query(
            `UPDATE ${table} SET ${setClause} WHERE ${condition.column} = $${values.length} RETURNING *`,
            values
          );
          
          return { data: result.rows[0], error: null };
        } catch (error) {
          console.error('Database update error:', error);
          return { data: null, error: 'Database update failed' };
        }
      },

      delete: async (condition: { column: string; value: any }) => {
        try {
          const result = await query(
            `DELETE FROM ${table} WHERE ${condition.column} = $1 RETURNING *`,
            [condition.value]
          );
          
          return { data: result.rows[0], error: null };
        } catch (error) {
          console.error('Database delete error:', error);
          return { data: null, error: 'Database delete failed' };
        }
      }
    })
  };
}

// Helper function to get current user session
export async function getCurrentUser() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  return user
}

// Helper function to require authentication
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
