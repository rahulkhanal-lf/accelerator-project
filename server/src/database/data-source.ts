import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

config(); // load .env

const __dirname = dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '../**/*.entity.ts')],
  migrations: [join(__dirname, './migrations/*.ts')],
  synchronize: false,
  logging: true,
});
