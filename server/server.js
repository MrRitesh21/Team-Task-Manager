const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

async function main() {
  console.log('Starting server...');
  
  // Validate essential environment variables
  const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
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
