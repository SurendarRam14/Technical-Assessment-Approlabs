import dotenv from 'dotenv';
import app from './app';
import { setupSwagger } from './config/swagger';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const prisma = new PrismaClient();

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected');

    // Automatically create tables (development only)
    exec('npx prisma db push', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Error creating tables:', err);
      } else {
        console.log('✅ Database schema is ready');
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      }
    });

    // Setup Swagger
    setupSwagger(app);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server started on http://localhost:${PORT}`);
      console.log(`📄 Swagger UI running at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
