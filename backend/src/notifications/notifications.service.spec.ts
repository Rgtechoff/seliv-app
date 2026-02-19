import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In } from 'typeorm';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';
import { Mission } from '../missions/entities/mission.entity';
import { MissionStatus } from '../common/enums/mission-status.enum';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockNotifRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockMissionRepo = {
  find: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const values: Record<string, string> = {
      RESEND_API_KEY: 'test-key',
      RESEND_FROM_EMAIL: 'noreply@seliv.fr',
    };
    return values[key] ?? defaultValue ?? '';
  }),
  getOrThrow: jest.fn((key: string) => {
    const values: Record<string, string> = {
      RESEND_API_KEY: 'test-key',
    };
    return values[key];
  }),
};

// Mock Resend so no real HTTP calls are made
const mockResendSend = jest.fn().mockResolvedValue({ id: 'email-id' });
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotifRepo,
        },
        {
          provide: getRepositoryToken(Mission),
          useValue: mockMissionRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  // -------------------------------------------------------------------------
  // 1. create()
  // -------------------------------------------------------------------------

  describe('create()', () => {
    it('doit créer une notification en base et la retourner avec un id', async () => {
      const notifData = {
        userId: 'user-uuid-1',
        type: NotificationType.MISSION_CREATED,
        title: 'Mission créée',
        body: 'Votre mission a été créée.',
        missionId: 'mission-uuid-1',
      };

      const createdEntity = {
        userId: notifData.userId,
        type: notifData.type,
        title: notifData.title,
        body: notifData.body,
        missionId: notifData.missionId,
      };

      const savedEntity: Partial<Notification> = {
        ...createdEntity,
        id: 'notif-uuid-1',
        isRead: false,
        isEmailSent: false,
        createdAt: new Date(),
      };

      mockNotifRepo.create.mockReturnValue(createdEntity);
      mockNotifRepo.save.mockResolvedValue(savedEntity);

      const result = await service.create(notifData);

      expect(mockNotifRepo.create).toHaveBeenCalledWith({
        userId: notifData.userId,
        type: notifData.type,
        title: notifData.title,
        body: notifData.body,
        missionId: notifData.missionId,
      });
      expect(mockNotifRepo.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(savedEntity);
      expect(result.id).toBe('notif-uuid-1');
    });

    it('doit créer une notification sans missionId (missionId null)', async () => {
      const notifData = {
        userId: 'user-uuid-2',
        type: NotificationType.VENDEUR_ASSIGNED,
        title: 'Vendeur assigné',
        body: 'Un vendeur a été assigné.',
      };

      const createdEntity = {
        userId: notifData.userId,
        type: notifData.type,
        title: notifData.title,
        body: notifData.body,
        missionId: null,
      };

      const savedEntity: Partial<Notification> = {
        ...createdEntity,
        id: 'notif-uuid-2',
        isRead: false,
        isEmailSent: false,
        createdAt: new Date(),
      };

      mockNotifRepo.create.mockReturnValue(createdEntity);
      mockNotifRepo.save.mockResolvedValue(savedEntity);

      const result = await service.create(notifData);

      expect(mockNotifRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ missionId: null }),
      );
      expect(result.id).toBe('notif-uuid-2');
    });

    it("ne doit pas envoyer d'email si sendEmail est false", async () => {
      const notifData = {
        userId: 'user-uuid-3',
        type: NotificationType.MISSION_REMINDER,
        title: 'Rappel',
        body: 'Votre mission est demain.',
        sendEmail: false,
        userEmail: 'test@example.com',
      };

      mockNotifRepo.create.mockReturnValue({ ...notifData, missionId: null });
      mockNotifRepo.save.mockResolvedValue({
        id: 'notif-uuid-3',
        ...notifData,
        missionId: null,
      });

      await service.create(notifData);

      expect(mockResendSend).not.toHaveBeenCalled();
      expect(mockNotifRepo.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // 2. markRead()
  // -------------------------------------------------------------------------

  describe('markRead()', () => {
    it('doit marquer la notification comme lue', async () => {
      mockNotifRepo.update.mockResolvedValue({ affected: 1 });

      await service.markRead('notif-uuid-1', 'user-uuid-1');

      expect(mockNotifRepo.update).toHaveBeenCalledWith(
        { id: 'notif-uuid-1', userId: 'user-uuid-1' },
        { isRead: true },
      );
    });

    it('ne doit pas lever d\'erreur si la notification n\'appartient pas à l\'utilisateur', async () => {
      mockNotifRepo.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.markRead('other-notif-uuid', 'user-uuid-1'),
      ).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // 3. create() avec sendEmail=true — vérifie que Resend est appelé
  // -------------------------------------------------------------------------

  describe('create() avec sendEmail=true', () => {
    it('doit appeler Resend si sendEmail=true et userEmail est fourni', async () => {
      const notifData = {
        userId: 'user-uuid-4',
        type: NotificationType.MISSION_CREATED,
        title: 'Mission créée',
        body: 'Votre mission a été créée.',
        missionId: 'mission-uuid-2',
        sendEmail: true,
        userEmail: 'client@example.com',
      };

      const savedEntity: Partial<Notification> = {
        id: 'notif-uuid-4',
        userId: notifData.userId,
        type: notifData.type,
        title: notifData.title,
        body: notifData.body,
        missionId: notifData.missionId,
        isRead: false,
        isEmailSent: false,
        createdAt: new Date(),
      };

      mockNotifRepo.create.mockReturnValue({
        userId: notifData.userId,
        type: notifData.type,
        title: notifData.title,
        body: notifData.body,
        missionId: notifData.missionId,
      });
      mockNotifRepo.save.mockResolvedValue(savedEntity);
      mockNotifRepo.update.mockResolvedValue({ affected: 1 });

      await service.create(notifData);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: notifData.title,
          from: 'noreply@seliv.fr',
        }),
      );
      expect(mockNotifRepo.update).toHaveBeenCalledWith(savedEntity.id, {
        isEmailSent: true,
      });
    });

    it("ne doit pas appeler Resend si RESEND_API_KEY est absent", async () => {
      // Override ConfigService pour simuler l'absence de clé
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'RESEND_API_KEY') return '';
          if (key === 'RESEND_FROM_EMAIL') return 'noreply@seliv.fr';
          return defaultValue ?? '';
        },
      );

      const notifData = {
        userId: 'user-uuid-5',
        type: NotificationType.MISSION_CREATED,
        title: 'Mission créée',
        body: 'Corps de test.',
        sendEmail: true,
        userEmail: 'noemail@example.com',
      };

      mockNotifRepo.create.mockReturnValue({ ...notifData, missionId: null });
      mockNotifRepo.save.mockResolvedValue({
        id: 'notif-uuid-5',
        ...notifData,
        missionId: null,
      });
      mockNotifRepo.update.mockResolvedValue({ affected: 1 });

      await service.create(notifData);

      // Resend.send ne doit PAS être appelé car la clé API est vide
      expect(mockResendSend).not.toHaveBeenCalled();

      // Restore original mock
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          const values: Record<string, string> = {
            RESEND_API_KEY: 'test-key',
            RESEND_FROM_EMAIL: 'noreply@seliv.fr',
          };
          return values[key] ?? defaultValue ?? '';
        },
      );
    });
  });

  // -------------------------------------------------------------------------
  // 4. sendMissionDayBeforeReminders() — cron J-1
  // -------------------------------------------------------------------------

  describe('sendMissionDayBeforeReminders()', () => {
    it('doit envoyer des rappels au client et au vendeur pour chaque mission de demain', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockMission = {
        id: 'mission-uuid-cron',
        clientId: 'client-uuid-1',
        vendeurId: 'vendeur-uuid-1',
        status: MissionStatus.ASSIGNED,
        date: tomorrow,
        client: { email: 'client@seliv.fr' } as unknown as Mission['client'],
        vendeur: { email: 'vendeur@seliv.fr' } as unknown as Mission['vendeur'],
      } as unknown as Mission;

      mockMissionRepo.find.mockResolvedValue([mockMission]);

      const savedNotif: Partial<Notification> = {
        id: 'notif-cron-1',
        isRead: false,
        isEmailSent: false,
        createdAt: new Date(),
      };

      mockNotifRepo.create.mockReturnValue({});
      mockNotifRepo.save.mockResolvedValue(savedNotif);
      mockNotifRepo.update.mockResolvedValue({ affected: 1 });

      await service.sendMissionDayBeforeReminders();

      // Doit avoir cherché les missions paid/assigned de demain
      expect(mockMissionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: In([MissionStatus.PAID, MissionStatus.ASSIGNED]),
          }),
          relations: ['client', 'vendeur'],
        }),
      );

      // 2 notifications créées (1 client + 1 vendeur)
      expect(mockNotifRepo.create).toHaveBeenCalledTimes(2);

      // 2 emails envoyés (client + vendeur)
      expect(mockResendSend).toHaveBeenCalledTimes(2);
    });

    it('ne doit pas envoyer de notification au vendeur si aucun vendeur assigné', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockMission = {
        id: 'mission-uuid-cron-2',
        clientId: 'client-uuid-2',
        vendeurId: null,
        status: MissionStatus.PAID,
        date: tomorrow,
        client: { email: 'client2@seliv.fr' } as unknown as Mission['client'],
        vendeur: null,
      } as unknown as Mission;

      mockMissionRepo.find.mockResolvedValue([mockMission]);

      const savedNotif: Partial<Notification> = {
        id: 'notif-cron-2',
        isRead: false,
        isEmailSent: false,
        createdAt: new Date(),
      };

      mockNotifRepo.create.mockReturnValue({});
      mockNotifRepo.save.mockResolvedValue(savedNotif);
      mockNotifRepo.update.mockResolvedValue({ affected: 1 });

      await service.sendMissionDayBeforeReminders();

      // Seulement 1 notification (client uniquement)
      expect(mockNotifRepo.create).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledTimes(1);
    });

    it('ne doit rien faire si aucune mission trouvée pour demain', async () => {
      mockMissionRepo.find.mockResolvedValue([]);

      await service.sendMissionDayBeforeReminders();

      expect(mockNotifRepo.create).not.toHaveBeenCalled();
      expect(mockResendSend).not.toHaveBeenCalled();
    });
  });
});
