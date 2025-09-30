import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/database';

// =====================================================
// HEALTH CHECK API ROUTE
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const dbHealthy = await checkDatabaseConnection();

    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        api: 'up'
      }
    };

    return NextResponse.json(health, {
      status: dbHealthy ? 200 : 503
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'down',
          api: 'up'
        },
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
} 