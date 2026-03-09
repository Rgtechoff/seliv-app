/**
 * Seed script – données de test SELIV
 * Usage : npm run seed
 *
 * Comptes créés :
 *  superadmin@seliv.fr   / SuperAdmin1! (SUPER_ADMIN)
 *  admin@seliv.fr        / Admin1234!   (ADMIN)
 *  modo@seliv.fr         / Modo1234!    (MODERATEUR + canModerate)
 *  client1@seliv.fr      / Client1234!  (CLIENT)
 *  client2@seliv.fr      / Client1234!  (CLIENT)
 *  vendeur1@seliv.fr     / Vendeur1234! (VENDEUR – validé, étoile)
 *  vendeur2@seliv.fr     / Vendeur1234! (VENDEUR – validé)
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Mission } from './missions/entities/mission.entity';
import { MissionOption } from './missions/entities/mission-option.entity';
import { Subscription, SubscriptionStatus } from './subscriptions/entities/subscription.entity';
import { ChatPreset } from './chat/entities/chat-preset.entity';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { Availability } from './availabilities/entities/availability.entity';
import { Review } from './reviews/entities/review.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Plan } from './plans/entities/plan.entity';
import { UserRole } from './common/enums/user-role.enum';
import { VendorLevel } from './common/enums/vendor-level.enum';
import { MissionStatus } from './common/enums/mission-status.enum';
import { VolumeEnum } from './common/enums/volume.enum';
import { SubscriptionPlan } from './common/enums/subscription-plan.enum';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://seliv:seliv_password@localhost:5432/seliv_db',
  entities: [User, Mission, MissionOption, Subscription, ChatPreset, ChatMessage, Availability, Review, Notification, Plan],
  synchronize: true,  // crée les tables si elles n'existent pas encore
  logging: false,
});

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Connexion DB établie');

  const userRepo = AppDataSource.getRepository(User);
  const missionRepo = AppDataSource.getRepository(Mission);
  const optionRepo = AppDataSource.getRepository(MissionOption);
  const subRepo = AppDataSource.getRepository(Subscription);
  const presetRepo = AppDataSource.getRepository(ChatPreset);
  const availRepo = AppDataSource.getRepository(Availability);

  // ── Nettoyage dans l'ordre FK ────────────────────────────────────────────
  await AppDataSource.query(
    `TRUNCATE TABLE mission_options, availabilities, subscriptions, chat_presets, missions, users RESTART IDENTITY CASCADE`,
  );
  console.log('🗑️  Tables vidées');

  // ── Utilisateurs ─────────────────────────────────────────────────────────
  const superAdmin = userRepo.create({
    email: 'superadmin@seliv.fr',
    passwordHash: await hash('SuperAdmin1!'),
    role: UserRole.SUPER_ADMIN,
    firstName: 'Super',
    lastName: 'Admin',
    isValidated: true,
    canModerate: true,
  });

  const admin = userRepo.create({
    email: 'admin@seliv.fr',
    passwordHash: await hash('Admin1234!'),
    role: UserRole.ADMIN,
    firstName: 'Sophie',
    lastName: 'Admin',
    isValidated: true,
    canModerate: true,
  });

  const modo = userRepo.create({
    email: 'modo@seliv.fr',
    passwordHash: await hash('Modo1234!'),
    role: UserRole.MODERATEUR,
    firstName: 'Marc',
    lastName: 'Modérateur',
    isValidated: true,
    canModerate: true,
  });

  const client1 = userRepo.create({
    email: 'client1@seliv.fr',
    passwordHash: await hash('Client1234!'),
    role: UserRole.CLIENT,
    firstName: 'Alice',
    lastName: 'Dupont',
    companyName: 'Boutique Alice',
    siret: '12345678901234',
    isValidated: true,
  });

  const client2 = userRepo.create({
    email: 'client2@seliv.fr',
    passwordHash: await hash('Client1234!'),
    role: UserRole.CLIENT,
    firstName: 'Bruno',
    lastName: 'Martin',
    companyName: 'Bruno Commerce',
    siret: '98765432109876',
    isValidated: true,
  });

  const vendeur1 = userRepo.create({
    email: 'vendeur1@seliv.fr',
    passwordHash: await hash('Vendeur1234!'),
    role: UserRole.VENDEUR,
    firstName: 'Clara',
    lastName: 'Leblanc',
    bio: 'Vendeuse passionnée, 5 ans d\'expérience en live shopping mode et beauté.',
    level: VendorLevel.CONFIRME,
    isStar: true,
    isValidated: true,
    zones: ['Paris', 'Île-de-France'],
    categories: ['mode', 'beauté'],
  });

  const vendeur2 = userRepo.create({
    email: 'vendeur2@seliv.fr',
    passwordHash: await hash('Vendeur1234!'),
    role: UserRole.VENDEUR,
    firstName: 'David',
    lastName: 'Petit',
    bio: 'Spécialiste high-tech et électronique, live dynamiques et engageants.',
    level: VendorLevel.DEBUTANT,
    isStar: false,
    isValidated: true,
    zones: ['Lyon', 'Bordeaux'],
    categories: ['high-tech', 'électronique'],
  });

  const [, savedAdmin, savedModo, savedC1, savedC2, savedV1, savedV2] =
    await userRepo.save([superAdmin, admin, modo, client1, client2, vendeur1, vendeur2]);
  console.log(`👤 ${7} utilisateurs créés`);

  // ── Plans d'abonnement ───────────────────────────────────────────────────
  const planRepo = AppDataSource.getRepository(Plan);
  await planRepo.save([
    planRepo.create({
      name: 'Basic',
      slug: 'basic',
      priceCents: 2900,
      billingPeriod: 'monthly',
      features: ['Accès standard aux missions', '5 missions/mois', 'Support email'],
      hourlyDiscountCents: 500,
      canAccessStar: false,
      maxMissionsPerMonth: 5,
      isActive: true,
      sortOrder: 1,
    }),
    planRepo.create({
      name: 'Pro',
      slug: 'pro',
      priceCents: 7900,
      billingPeriod: 'monthly',
      features: ['Missions illimitées', 'Accès vendeurs Star', 'Réduction horaire', 'Support prioritaire'],
      hourlyDiscountCents: 1500,
      canAccessStar: true,
      maxMissionsPerMonth: null,
      isActive: true,
      sortOrder: 2,
    }),
    planRepo.create({
      name: 'Enterprise',
      slug: 'enterprise',
      priceCents: 19900,
      billingPeriod: 'monthly',
      features: ['Missions illimitées', 'Vendeurs Star dédiés', 'Réduction horaire maximale', 'Account manager', 'Facturation personnalisée'],
      hourlyDiscountCents: 3000,
      canAccessStar: true,
      maxMissionsPerMonth: null,
      isActive: true,
      sortOrder: 3,
    }),
  ]);
  console.log('📦 Plans créés');

  // ── Abonnements vendeurs ──────────────────────────────────────────────────
  const now = new Date();
  const inOneMonth = new Date(now);
  inOneMonth.setMonth(inOneMonth.getMonth() + 1);

  await subRepo.save([
    subRepo.create({
      userId: savedV1.id,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: inOneMonth,
      hourlyDiscount: 15,
    }),
    subRepo.create({
      userId: savedV2.id,
      plan: SubscriptionPlan.BASIC,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: inOneMonth,
      hourlyDiscount: 5,
    }),
  ]);
  console.log('💳 Abonnements créés');

  // ── Disponibilités vendeur1 (lun-ven 9h-18h) ─────────────────────────────
  const slots = [];
  for (let day = 1; day <= 5; day++) {
    slots.push(
      availRepo.create({
        userId: savedV1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      }),
    );
  }
  // vendeur2 : sam-dim
  for (let day = 0; day <= 6; day += 6) {
    slots.push(
      availRepo.create({
        userId: savedV2.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '20:00',
        isAvailable: true,
      }),
    );
  }
  await availRepo.save(slots);
  console.log('📅 Disponibilités créées');

  // ── Missions ──────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const m1 = missionRepo.create({
    clientId: savedC1.id,
    vendeurId: savedV1.id,
    status: MissionStatus.ASSIGNED,
    date: tomorrow,
    startTime: '14:00',
    durationHours: 2,
    address: '15 rue du Commerce',
    city: 'Paris',
    category: 'mode',
    volume: VolumeEnum.V50,
    basePrice: 12000,
    optionsPrice: 2000,
    discount: 0,
    totalPrice: 14000,
    paidAt: new Date(),
  });

  const m2 = missionRepo.create({
    clientId: savedC2.id,
    vendeurId: savedV2.id,
    status: MissionStatus.COMPLETED,
    date: lastWeek,
    startTime: '10:00',
    durationHours: 3,
    address: '8 avenue Victor Hugo',
    city: 'Lyon',
    category: 'high-tech',
    volume: VolumeEnum.V100,
    basePrice: 18000,
    optionsPrice: 0,
    discount: 5,
    totalPrice: 17100,
    paidAt: new Date(lastWeek),
    completedAt: new Date(lastWeek),
  });

  const m3 = missionRepo.create({
    clientId: savedC1.id,
    status: MissionStatus.PAID,
    date: nextWeek,
    startTime: '11:00',
    durationHours: 1,
    address: '42 boulevard Haussmann',
    city: 'Paris',
    category: 'beauté',
    volume: VolumeEnum.V30,
    basePrice: 6000,
    optionsPrice: 1500,
    discount: 0,
    totalPrice: 7500,
    paidAt: new Date(),
  });

  const m4 = missionRepo.create({
    clientId: savedC2.id,
    status: MissionStatus.CANCELLED,
    date: lastWeek,
    startTime: '16:00',
    durationHours: 2,
    address: '3 rue de la Paix',
    city: 'Bordeaux',
    category: 'électronique',
    volume: VolumeEnum.V50,
    basePrice: 12000,
    optionsPrice: 0,
    discount: 0,
    totalPrice: 12000,
    cancelledAt: new Date(lastWeek),
    cancellationReason: 'Annulation client – raison personnelle',
  });

  const [savedM1, savedM2, savedM3] = await missionRepo.save([m1, m2, m3, m4]);
  console.log(`📋 4 missions créées`);

  // ── Options de missions ───────────────────────────────────────────────────
  await optionRepo.save([
    optionRepo.create({ missionId: savedM1.id, optionType: 'shooting_photo', optionDetail: '15 photos HD', price: 1500 }),
    optionRepo.create({ missionId: savedM1.id, optionType: 'montage_video', optionDetail: 'Montage 30s', price: 500 }),
    optionRepo.create({ missionId: savedM3.id, optionType: 'shooting_photo', optionDetail: '10 photos HD', price: 1500 }),
  ]);
  console.log('🎨 Options de missions créées');

  // ── Presets chat ──────────────────────────────────────────────────────────
  const presets = [
    // Client
    { category: 'salutation', label: 'Bonjour ! Je suis ravi(e) de travailler avec vous sur cette mission.', role: 'client', sortOrder: 1 },
    { category: 'question', label: 'Pouvez-vous me confirmer l\'heure de début du live ?', role: 'client', sortOrder: 2 },
    { category: 'question', label: 'Quels sont les produits prioritaires à mettre en avant ?', role: 'client', sortOrder: 3 },
    { category: 'logistique', label: 'Je vous enverrai les produits 48h avant la mission.', role: 'client', sortOrder: 4 },
    // Vendeur
    { category: 'salutation', label: 'Bonjour ! J\'ai bien reçu les détails de la mission, tout est clair pour moi.', role: 'vendeur', sortOrder: 1 },
    { category: 'confirmation', label: 'Je confirme ma présence pour la date et l\'heure convenues.', role: 'vendeur', sortOrder: 2 },
    { category: 'question', label: 'Y a-t-il un dress code particulier pour ce live ?', role: 'vendeur', sortOrder: 3 },
    { category: 'logistique', label: 'Merci de m\'envoyer les fiches produits avant le live.', role: 'vendeur', sortOrder: 4 },
    // Général
    { category: 'validation', label: 'La mission s\'est bien déroulée, merci pour votre collaboration !', role: null, sortOrder: 1 },
  ];

  await presetRepo.save(presets.map((p) => presetRepo.create(p)));
  console.log('💬 Presets chat créés');

  await AppDataSource.destroy();

  console.log('\n🎉 Seed terminé avec succès !\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  COMPTES DE TEST                                        │');
  console.log('├──────────────────────────┬──────────────────────────────┤');
  console.log('│  superadmin@seliv.fr     │  SuperAdmin1! (Super Admin)  │');
  console.log('│  admin@seliv.fr          │  Admin1234!   (Admin)        │');
  console.log('│  modo@seliv.fr           │  Modo1234!    (Modérateur)   │');
  console.log('│  client1@seliv.fr        │  Client1234!  (Client)       │');
  console.log('│  client2@seliv.fr        │  Client1234!  (Client)       │');
  console.log('│  vendeur1@seliv.fr       │  Vendeur1234! (Vendeur ⭐)   │');
  console.log('│  vendeur2@seliv.fr       │  Vendeur1234! (Vendeur)      │');
  console.log('└──────────────────────────┴──────────────────────────────┘');
}

seed().catch((err) => {
  console.error('❌ Seed échoué :', err);
  process.exit(1);
});
