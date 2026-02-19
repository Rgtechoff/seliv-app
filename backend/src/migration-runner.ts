/**
 * Exécute automatiquement les migrations TypeORM au démarrage du container.
 * Appelé dans le Dockerfile avant `node dist/main`.
 *
 * En dev : ignoré (synchronize: true dans app.module.ts)
 * En prod : applique toutes les migrations en attente
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function runMigrations(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '**', '*.entity.js')],
    migrations: [join(__dirname, 'migrations', '*.js')],
    synchronize: false,
    logging: true,
  });

  console.log('🔄 Connexion à la base de données...');
  await dataSource.initialize();

  const pendingMigrations = await dataSource.showMigrations();

  if (!pendingMigrations) {
    console.log('✅ Aucune migration en attente.');
  } else {
    console.log('🚀 Exécution des migrations en attente...');
    const ran = await dataSource.runMigrations({ transaction: 'all' });
    console.log(`✅ ${ran.length} migration(s) appliquée(s) :`, ran.map((m) => m.name));
  }

  await dataSource.destroy();
  console.log('✅ Migrations terminées.');
}

runMigrations().catch((err) => {
  console.error('❌ Erreur lors des migrations :', err);
  process.exit(1);
});
