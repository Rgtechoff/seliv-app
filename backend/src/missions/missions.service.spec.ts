import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionsService } from './missions.service';
import { Mission } from './entities/mission.entity';
import { MissionOption } from './entities/mission-option.entity';
import { PricingService } from './pricing.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MissionStatus } from '../common/enums/mission-status.enum';

const mockMission = (overrides: Partial<Mission> = {}): Mission =>
  ({
    id: 'mission-uuid',
    clientId: 'client-uuid',
    vendeurId: null,
    status: MissionStatus.PAID,
    date: new Date('2026-04-01'),
    startTime: '14:00',
    durationHours: 3,
    city: 'Paris',
    address: '15 rue de Rivoli',
    category: 'mode',
    volume: '100' as const,
    basePrice: 33000,
    optionsPrice: 0,
    discount: 0,
    totalPrice: 33000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Mission);

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockOptionRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('MissionsService — State Machine', () => {
  let service: MissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        { provide: getRepositoryToken(Mission), useValue: mockRepo },
        { provide: getRepositoryToken(MissionOption), useValue: mockOptionRepo },
        { provide: PricingService, useValue: { calculateTotalPrice: jest.fn(() => ({ basePrice: 33000, optionsPrice: 0, discount: 0, totalPrice: 33000 })) } },
        { provide: SubscriptionsService, useValue: { getUserPlan: jest.fn(() => null) } },
        { provide: NotificationsService, useValue: { notifyMissionCreated: jest.fn(), notifyVendeurAssigned: jest.fn(), notifyMissionCompleted: jest.fn(), notifyNewMissionAvailable: jest.fn() } },
      ],
    }).compile();

    service = module.get<MissionsService>(MissionsService);
    jest.clearAllMocks();
  });

  describe('assignVendeur', () => {
    it('should assign vendeur to a PAID mission', async () => {
      const mission = mockMission({ status: MissionStatus.PAID });
      mockRepo.findOne.mockResolvedValue(mission);
      mockRepo.save.mockResolvedValue({ ...mission, vendeurId: 'vendeur-uuid', status: MissionStatus.ASSIGNED });

      const result = await service.assignVendeur('mission-uuid', 'vendeur-uuid');
      expect(result.status).toBe(MissionStatus.ASSIGNED);
      expect(result.vendeurId).toBe('vendeur-uuid');
    });

    it('should throw BadRequestException if mission is not PAID', async () => {
      const mission = mockMission({ status: MissionStatus.DRAFT });
      mockRepo.findOne.mockResolvedValue(mission);

      await expect(service.assignVendeur('mission-uuid', 'vendeur-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel — 48h rule', () => {
    it('should grant 100% refund if cancellation is ≥48h before live', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // 5 days ahead
      const mission = mockMission({
        status: MissionStatus.PAID,
        date: futureDate,
        totalPrice: 50000,
      });
      mockRepo.findOne.mockResolvedValue(mission);
      mockRepo.save.mockImplementation(async (m) => m);

      const result = await service.cancel('mission-uuid', 'client-uuid', 'Test');
      expect(result.mission.status).toBe(MissionStatus.CANCELLED);
      expect(result.refundPercent).toBe(100);
    });

    it('should grant 50% refund if cancellation is <48h before live', async () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 24); // 24h ahead
      const mission = mockMission({
        status: MissionStatus.ASSIGNED,
        date: soonDate,
        totalPrice: 50000,
      });
      mockRepo.findOne.mockResolvedValue(mission);
      mockRepo.save.mockImplementation(async (m) => m);

      const result = await service.cancel('mission-uuid', 'client-uuid', 'Test');
      expect(result.mission.status).toBe(MissionStatus.CANCELLED);
      expect(result.refundPercent).toBe(50);
    });

    it('should throw BadRequestException if mission is in_progress', async () => {
      const mission = mockMission({ status: MissionStatus.IN_PROGRESS });
      mockRepo.findOne.mockResolvedValue(mission);

      await expect(service.cancel('mission-uuid', 'client-uuid', 'Test')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
