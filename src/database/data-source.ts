import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const databaseUrl = process.env.DATABASE_URL;
const port = Number(process.env.DB_PORT ?? '5432');

const dbSslVal = process.env.DB_SSL;
let dbSsl = false;

if (dbSslVal !== undefined) {
  dbSsl = dbSslVal === 'true';
} else {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost =
    (databaseUrl && (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'))) ||
    (!databaseUrl &&
      ((process.env.DB_HOST ?? 'localhost') === 'localhost' ||
        process.env.DB_HOST === '127.0.0.1'));
  dbSsl = isProduction && !isLocalhost;
}

const sslConfig = dbSsl ? { rejectUnauthorized: false } : undefined;

export default new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: [join(__dirname, '../domain/entity/*.entity.{js,ts}')],
        migrations: [join(__dirname, './migrations/*.{js,ts}')],
        synchronize: false,
        ssl: sslConfig,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number.isNaN(port) ? 5432 : port,
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'finsight_db',
        entities: [join(__dirname, '../domain/entity/*.entity.{js,ts}')],
        migrations: [join(__dirname, './migrations/*.{js,ts}')],
        synchronize: false,
        ssl: sslConfig,
      },
);
