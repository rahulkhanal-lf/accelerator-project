import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/database/migrations/*.js'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
}));
