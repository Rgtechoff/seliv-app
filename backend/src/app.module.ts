import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MissionsModule } from './missions/missions.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { OptionsModule } from './options/options.module';
import { AdminModule } from './admin/admin.module';
import { VendeursPublicModule } from './vendeurs-public/vendeurs-public.module';
import { PlansModule } from './plans/plans.module';
import { ServicesCatalogModule } from './services-catalog/services-catalog.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { ActivityLogInterceptor } from './activity-log/activity-log.interceptor';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        // En prod : synchronize=false sauf si DB_SYNC=true (premier déploiement uniquement)
        synchronize:
          configService.get<string>('NODE_ENV') !== 'production' ||
          configService.get<string>('DB_SYNC') === 'true',
        logging: configService.get<string>('NODE_ENV') === 'development',
        // SSL uniquement si DB_SSL=true (pour bases managées : AWS RDS, Supabase...)
        // Laisser à false pour un postgres Docker local
        ssl: configService.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 10 },
    ]),
    AuthModule,
    UsersModule,
    MissionsModule,
    PaymentsModule,
    SubscriptionsModule,
    ChatModule,
    ReviewsModule,
    NotificationsModule,
    AvailabilitiesModule,
    OptionsModule,
    AdminModule,
    VendeursPublicModule,
    PlansModule,
    ServicesCatalogModule,
    ActivityLogModule,
    SuperAdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ActivityLogInterceptor },
  ],
})
export class AppModule {}
