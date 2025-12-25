import mysql from 'mysql2/promise';

export async function ensureDatabaseExists() {
  const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    DATABASE_NAME,
  } = process.env;

  if (!DATABASE_NAME) {
    throw new Error('DATABASE_NAME is missing in .env');
  }

  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\``
  );

  await connection.end();
  console.log('! Database ensured');
}
