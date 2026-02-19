"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const user_entity_1 = require("./users/entities/user.entity");
const mission_entity_1 = require("./missions/entities/mission.entity");
const mission_option_entity_1 = require("./missions/entities/mission-option.entity");
const subscription_entity_1 = require("./subscriptions/entities/subscription.entity");
const chat_preset_entity_1 = require("./chat/entities/chat-preset.entity");
const availability_entity_1 = require("./availabilities/entities/availability.entity");
const user_role_enum_1 = require("./common/enums/user-role.enum");
const vendor_level_enum_1 = require("./common/enums/vendor-level.enum");
const mission_status_enum_1 = require("./common/enums/mission-status.enum");
const volume_enum_1 = require("./common/enums/volume.enum");
const subscription_plan_enum_1 = require("./common/enums/subscription-plan.enum");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL ?? 'postgresql://seliv:seliv_password@localhost:5432/seliv_db',
    entities: [user_entity_1.User, mission_entity_1.Mission, mission_option_entity_1.MissionOption, subscription_entity_1.Subscription, chat_preset_entity_1.ChatPreset, availability_entity_1.Availability],
    synchronize: false,
    logging: false,
});
async function hash(password) {
    return bcrypt.hash(password, 10);
}
async function seed() {
    await AppDataSource.initialize();
    console.log('✅ Connexion DB établie');
    const userRepo = AppDataSource.getRepository(user_entity_1.User);
    const missionRepo = AppDataSource.getRepository(mission_entity_1.Mission);
    const optionRepo = AppDataSource.getRepository(mission_option_entity_1.MissionOption);
    const subRepo = AppDataSource.getRepository(subscription_entity_1.Subscription);
    const presetRepo = AppDataSource.getRepository(chat_preset_entity_1.ChatPreset);
    const availRepo = AppDataSource.getRepository(availability_entity_1.Availability);
    await AppDataSource.query(`TRUNCATE TABLE mission_options, availabilities, subscriptions, chat_presets, missions, users RESTART IDENTITY CASCADE`);
    console.log('🗑️  Tables vidées');
    const admin = userRepo.create({
        email: 'admin@seliv.fr',
        passwordHash: await hash('Admin1234!'),
        role: user_role_enum_1.UserRole.ADMIN,
        firstName: 'Sophie',
        lastName: 'Admin',
        isValidated: true,
        canModerate: true,
    });
    const modo = userRepo.create({
        email: 'modo@seliv.fr',
        passwordHash: await hash('Modo1234!'),
        role: user_role_enum_1.UserRole.MODERATEUR,
        firstName: 'Marc',
        lastName: 'Modérateur',
        isValidated: true,
        canModerate: true,
    });
    const client1 = userRepo.create({
        email: 'client1@seliv.fr',
        passwordHash: await hash('Client1234!'),
        role: user_role_enum_1.UserRole.CLIENT,
        firstName: 'Alice',
        lastName: 'Dupont',
        companyName: 'Boutique Alice',
        siret: '12345678901234',
        isValidated: true,
    });
    const client2 = userRepo.create({
        email: 'client2@seliv.fr',
        passwordHash: await hash('Client1234!'),
        role: user_role_enum_1.UserRole.CLIENT,
        firstName: 'Bruno',
        lastName: 'Martin',
        companyName: 'Bruno Commerce',
        siret: '98765432109876',
        isValidated: true,
    });
    const vendeur1 = userRepo.create({
        email: 'vendeur1@seliv.fr',
        passwordHash: await hash('Vendeur1234!'),
        role: user_role_enum_1.UserRole.VENDEUR,
        firstName: 'Clara',
        lastName: 'Leblanc',
        bio: 'Vendeuse passionnée, 5 ans d\'expérience en live shopping mode et beauté.',
        level: vendor_level_enum_1.VendorLevel.CONFIRME,
        isStar: true,
        isValidated: true,
        zones: ['Paris', 'Île-de-France'],
        categories: ['mode', 'beauté'],
    });
    const vendeur2 = userRepo.create({
        email: 'vendeur2@seliv.fr',
        passwordHash: await hash('Vendeur1234!'),
        role: user_role_enum_1.UserRole.VENDEUR,
        firstName: 'David',
        lastName: 'Petit',
        bio: 'Spécialiste high-tech et électronique, live dynamiques et engageants.',
        level: vendor_level_enum_1.VendorLevel.DEBUTANT,
        isStar: false,
        isValidated: true,
        zones: ['Lyon', 'Bordeaux'],
        categories: ['high-tech', 'électronique'],
    });
    const [savedAdmin, savedModo, savedC1, savedC2, savedV1, savedV2] = await userRepo.save([admin, modo, client1, client2, vendeur1, vendeur2]);
    console.log(`👤 ${6} utilisateurs créés`);
    const now = new Date();
    const inOneMonth = new Date(now);
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);
    await subRepo.save([
        subRepo.create({
            userId: savedV1.id,
            plan: subscription_plan_enum_1.SubscriptionPlan.PRO,
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: inOneMonth,
            hourlyDiscount: 15,
        }),
        subRepo.create({
            userId: savedV2.id,
            plan: subscription_plan_enum_1.SubscriptionPlan.BASIC,
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: inOneMonth,
            hourlyDiscount: 5,
        }),
    ]);
    console.log('💳 Abonnements créés');
    const slots = [];
    for (let day = 1; day <= 5; day++) {
        slots.push(availRepo.create({
            userId: savedV1.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            isAvailable: true,
        }));
    }
    for (let day = 0; day <= 6; day += 6) {
        slots.push(availRepo.create({
            userId: savedV2.id,
            dayOfWeek: day,
            startTime: '10:00',
            endTime: '20:00',
            isAvailable: true,
        }));
    }
    await availRepo.save(slots);
    console.log('📅 Disponibilités créées');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const m1 = missionRepo.create({
        clientId: savedC1.id,
        vendeurId: savedV1.id,
        status: mission_status_enum_1.MissionStatus.ASSIGNED,
        date: tomorrow,
        startTime: '14:00',
        durationHours: 2,
        address: '15 rue du Commerce',
        city: 'Paris',
        category: 'mode',
        volume: volume_enum_1.VolumeEnum.V50,
        basePrice: 12000,
        optionsPrice: 2000,
        discount: 0,
        totalPrice: 14000,
        paidAt: new Date(),
    });
    const m2 = missionRepo.create({
        clientId: savedC2.id,
        vendeurId: savedV2.id,
        status: mission_status_enum_1.MissionStatus.COMPLETED,
        date: lastWeek,
        startTime: '10:00',
        durationHours: 3,
        address: '8 avenue Victor Hugo',
        city: 'Lyon',
        category: 'high-tech',
        volume: volume_enum_1.VolumeEnum.V100,
        basePrice: 18000,
        optionsPrice: 0,
        discount: 5,
        totalPrice: 17100,
        paidAt: new Date(lastWeek),
        completedAt: new Date(lastWeek),
    });
    const m3 = missionRepo.create({
        clientId: savedC1.id,
        status: mission_status_enum_1.MissionStatus.PAID,
        date: nextWeek,
        startTime: '11:00',
        durationHours: 1,
        address: '42 boulevard Haussmann',
        city: 'Paris',
        category: 'beauté',
        volume: volume_enum_1.VolumeEnum.V30,
        basePrice: 6000,
        optionsPrice: 1500,
        discount: 0,
        totalPrice: 7500,
        paidAt: new Date(),
    });
    const m4 = missionRepo.create({
        clientId: savedC2.id,
        status: mission_status_enum_1.MissionStatus.CANCELLED,
        date: lastWeek,
        startTime: '16:00',
        durationHours: 2,
        address: '3 rue de la Paix',
        city: 'Bordeaux',
        category: 'électronique',
        volume: volume_enum_1.VolumeEnum.V50,
        basePrice: 12000,
        optionsPrice: 0,
        discount: 0,
        totalPrice: 12000,
        cancelledAt: new Date(lastWeek),
        cancellationReason: 'Annulation client – raison personnelle',
    });
    const [savedM1, savedM2, savedM3] = await missionRepo.save([m1, m2, m3, m4]);
    console.log(`📋 4 missions créées`);
    await optionRepo.save([
        optionRepo.create({ missionId: savedM1.id, optionType: 'shooting_photo', optionDetail: '15 photos HD', price: 1500 }),
        optionRepo.create({ missionId: savedM1.id, optionType: 'montage_video', optionDetail: 'Montage 30s', price: 500 }),
        optionRepo.create({ missionId: savedM3.id, optionType: 'shooting_photo', optionDetail: '10 photos HD', price: 1500 }),
    ]);
    console.log('🎨 Options de missions créées');
    const presets = [
        { category: 'salutation', label: 'Bonjour ! Je suis ravi(e) de travailler avec vous sur cette mission.', role: 'client', sortOrder: 1 },
        { category: 'question', label: 'Pouvez-vous me confirmer l\'heure de début du live ?', role: 'client', sortOrder: 2 },
        { category: 'question', label: 'Quels sont les produits prioritaires à mettre en avant ?', role: 'client', sortOrder: 3 },
        { category: 'logistique', label: 'Je vous enverrai les produits 48h avant la mission.', role: 'client', sortOrder: 4 },
        { category: 'salutation', label: 'Bonjour ! J\'ai bien reçu les détails de la mission, tout est clair pour moi.', role: 'vendeur', sortOrder: 1 },
        { category: 'confirmation', label: 'Je confirme ma présence pour la date et l\'heure convenues.', role: 'vendeur', sortOrder: 2 },
        { category: 'question', label: 'Y a-t-il un dress code particulier pour ce live ?', role: 'vendeur', sortOrder: 3 },
        { category: 'logistique', label: 'Merci de m\'envoyer les fiches produits avant le live.', role: 'vendeur', sortOrder: 4 },
        { category: 'validation', label: 'La mission s\'est bien déroulée, merci pour votre collaboration !', role: null, sortOrder: 1 },
    ];
    await presetRepo.save(presets.map((p) => presetRepo.create(p)));
    console.log('💬 Presets chat créés');
    await AppDataSource.destroy();
    console.log('\n🎉 Seed terminé avec succès !\n');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│  COMPTES DE TEST                                        │');
    console.log('├──────────────────────────┬──────────────────────────────┤');
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
//# sourceMappingURL=seed.js.map