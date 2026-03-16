import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      companyName: dto.companyName,
      siret: dto.siret,
    });

    const token = this.generateToken(user);
    return { access_token: token, user: this.sanitizeUser(user) };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);
    return { access_token: token, user: this.sanitizeUser(user) };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    // Always succeed silently — never reveal if email exists
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepo.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: expires,
    });

    await this.emailService.sendPasswordReset(user.email, user.firstName, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash: _pw, ...sanitized } = user;
    return sanitized;
  }
}
