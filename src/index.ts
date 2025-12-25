import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { setupSwagger } from './config/swagger';
import prisma from './config/prisma';
import { ensureDatabaseExists } from './config/db-init';
import { exec } from 'child_process';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    // Ensure DB exists
    await ensureDatabaseExists();

    // Connect Prisma
    await prisma.$connect();
    console.log('Prisma connected');

    // Sync schema (DEV ONLY)
    if (process.env.NODE_ENV !== 'production') {
      exec('npx prisma db push', (err) => {
        if (err) console.error('Prisma sync failed', err);
        else console.log('Prisma schema synced');
      });
    }

    // Swagger
    setupSwagger(app);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Server start failed:', error);
    process.exit(1);
  }
}

startServer();
