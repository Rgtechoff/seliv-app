import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: 'hashed',
  role: UserRole.CLIENT,
  firstName: 'Jean',
  lastName: 'Dupont',
};

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: UserRole.CLIENT,
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Jean',
          lastName: 'Dupont',
          role: UserRole.CLIENT,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });
      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'unknown@example.com', password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
