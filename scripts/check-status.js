const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkStatus() {
  console.log('🏥 Healthcare Platform Status Check');
  console.log('==================================');
  console.log('');

  // Check database connection
  try {
    console.log('🔍 Checking database connection...');
    const dbResult = await execAsync('docker exec healthcare-postgres psql -U healthcare_user -d healthcare_db -c "SELECT COUNT(*) FROM users;"');
    const userCount = dbResult.stdout.trim().split('\n')[2].trim();
    console.log(`✅ Database connected - ${userCount} users found`);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }

  // Check Docker container
  try {
    console.log('🐳 Checking Docker container...');
    const containerResult = await execAsync('docker ps --filter name=healthcare-postgres --format "{{.Status}}"');
    const status = containerResult.stdout.trim();
    if (status.includes('Up')) {
      console.log('✅ PostgreSQL container is running');
    } else {
      console.log('❌ PostgreSQL container is not running');
      return false;
    }
  } catch (error) {
    console.log('❌ Docker check failed:', error.message);
    return false;
  }

  // Check environment file
  const fs = require('fs');
  if (fs.existsSync('.env.local')) {
    console.log('✅ Environment file (.env.local) exists');
  } else {
    console.log('❌ Environment file (.env.local) missing');
    return false;
  }

  // Check dependencies
  if (fs.existsSync('node_modules')) {
    console.log('✅ Dependencies installed');
  } else {
    console.log('❌ Dependencies not installed');
    return false;
  }

  console.log('');
  console.log('🎉 All systems ready!');
  console.log('');
  console.log('🌐 Next steps:');
  console.log('   1. Development server should be running at: http://localhost:3000');
  console.log('   2. Database is accessible at: postgresql://healthcare_user:healthcare_password@localhost:5432/healthcare_db');
  console.log('   3. Sample users created:');
  console.log('      - admin@hospital.com (super_admin)');
  console.log('      - doctor@hospital.com (doctor)');
  console.log('      - patient@hospital.com (patient)');
  console.log('');
  console.log('📚 Documentation:');
  console.log('   - Architecture: ARCHITECTURE.md');
  console.log('   - Development Roadmap: DEVELOPMENT_ROADMAP.md');
  console.log('   - Implementation Guide: IMPLEMENTATION_GUIDE.md');
  console.log('');

  return true;
}

checkStatus().catch(console.error); 