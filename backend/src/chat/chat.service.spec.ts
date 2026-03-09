import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatPreset } from './entities/chat-preset.entity';
import { NotificationsService } from '../notifications/notifications.service';

const mockMessageRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockPresetRepo = {
  find: jest.fn(() => []),
  count: jest.fn(() => 0),
  save: jest.fn(),
  create: jest.fn((x) => x),
};

const mockNotificationsService = {
  notifyFlaggedMessage: jest.fn(),
};

describe('ChatService — Modération', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(ChatMessage), useValue: mockMessageRepo },
        { provide: getRepositoryToken(ChatPreset), useValue: mockPresetRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
    mockMessageRepo.create.mockImplementation((dto) => ({ ...dto }));
    mockMessageRepo.save.mockImplementation(async (msg) => ({ id: 'msg-uuid', createdAt: new Date(), ...msg }));
  });

  const blockedCases = [
    { desc: 'numéro mobile FR (06)', content: 'Appelez-moi au 0612345678' },
    { desc: 'numéro mobile FR (07)', content: 'Mon numéro : 0712345678' },
    { desc: 'numéro international +33', content: '+33612345678' },
    { desc: 'email', content: 'Contactez jean.dupont@gmail.com' },
    { desc: 'WhatsApp', content: 'Ajoutez-moi sur WhatsApp' },
    { desc: 'Telegram', content: 'Je suis sur Telegram' },
    { desc: 'Signal', content: 'Utilisez Signal svp' },
    { desc: 'lien Instagram', content: 'https://instagram.com/test' },
    { desc: 'lien TikTok', content: 'https://tiktok.com/@test' },
    { desc: 'nombre 10 chiffres', content: '1234567890' },
  ];

  blockedCases.forEach(({ desc, content }) => {
    it(`doit flaguer un message contenant ${desc}`, async () => {
      const msg = await service.sendMessage('mission-id', 'sender-id', content, false);
      expect(msg.isFlagged).toBe(true);
    });
  });

  it('doit laisser passer un message normal', async () => {
    const msg = await service.sendMessage('mission-id', 'sender-id', 'Le live commence dans 5 min !', false);
    expect(msg.isFlagged).toBe(false);
  });

  it('doit laisser passer un message de 9 chiffres (non bloqué)', async () => {
    const msg = await service.sendMessage('mission-id', 'sender-id', 'Boîte n°123456789', false);
    expect(msg.isFlagged).toBe(false);
  });
});
