const { Pool } = require('pg');

// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's fine
}

console.log('🧪 Testing Neon Database Connection');
console.log('===================================');

async function testConnection() {
  // Use the provided connection string
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_TfCLG5ti0ean@ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
  
  console.log('🔗 Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'));
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to Neon database...');
    const client = await pool.connect();
    
    console.log('✅ Connection successful!');
    
    // Test basic queries
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Server time:', timeResult.rows[0].current_time);
    
    const versionResult = await client.query('SELECT version() as db_version');
    console.log('🗄️  Database version:', versionResult.rows[0].db_version.split(',')[0]);
    
    const dbInfoResult = await client.query('SELECT current_database(), current_user, inet_server_addr(), inet_server_port()');
    console.log('📊 Database info:');
    console.log('   Database:', dbInfoResult.rows[0].current_database);
    console.log('   User:', dbInfoResult.rows[0].current_user);
    console.log('   Server:', dbInfoResult.rows[0].inet_server_addr || 'N/A');
    console.log('   Port:', dbInfoResult.rows[0].inet_server_port || 'N/A');
    
    // Test table existence
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   No tables found (run migrations first)');
    }
    
    client.release();
    console.log('');
    console.log('🎉 Connection test completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Copy env.example to .env');
    console.log('2. Run: npm run db:migrate');
    console.log('3. Run: npm run db:seed');
    console.log('4. Run: npm run dev');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL is correct');
    console.log('2. Ensure your Neon database is active (not suspended)');
    console.log('3. Verify your credentials in the connection string');
    console.log('4. Check if your IP is allowed (Neon allows all by default)');
    console.log('5. Make sure SSL is enabled (sslmode=require)');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection(); 