/**
 * TypeORM DataSource — utilisé par le CLI pour générer et exécuter les migrations.
 *
 * Usage :
 *   npm run migration:generate -- src/migrations/NomDeLaMigration
 *   npm run migration:run
 *   npm run migration:revert
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
