const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    // Test if we can connect to the database
    const result = await execAsync(
      'docker exec healthcare-postgres psql -U healthcare_user -d healthcare_db -c "SELECT version();"',
      { timeout: 10000 }
    );
    
    console.log('✅ Database connection successful!');
    console.log('📊 PostgreSQL version:', result.stdout.split('\n')[2].trim());
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('💡 Make sure the PostgreSQL container is running and ready.');
    return false;
  }
}

// Test the connection
testConnection().then(success => {
  if (success) {
    console.log('🎉 Ready to run database schema!');
  } else {
    console.log('⚠️  Please wait a few seconds for the database to initialize, then try again.');
  }
}); 