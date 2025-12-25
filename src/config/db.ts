import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err: unknown) => console.error('Database connection error:', err));

export default prisma;
