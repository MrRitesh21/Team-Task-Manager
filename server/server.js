const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

async function main() {
  console.log('Starting server...');
  
  // Validate essential environment variables
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET is missing. Using a temporary fallback.');
    process.env.JWT_SECRET = 'temp_secret_for_development_only_12345';
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('⚠️ WARNING: JWT_REFRESH_SECRET is missing. Using a temporary fallback.');
    process.env.JWT_REFRESH_SECRET = 'temp_refresh_secret_for_development_only_67890';
  }

  const requiredEnv = ['DATABASE_URL'];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);
  
  if (missingEnv.length > 0) {
    console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
    console.error('Please add these to your Railway service variables.');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully');

    // Programmatically push schema to ensure tables exist
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Syncing database schema...');
      const { execSync } = require('child_process');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ Database schema synced');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`URL: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Full Error:', error);
    process.exit(1);
  }
}

main();
