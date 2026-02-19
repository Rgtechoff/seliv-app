import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { VendorLevel } from '../common/enums/vendor-level.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyName?: string;
    siret?: string;
  }): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async validateVendeur(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.isValidated = true;
    return this.userRepo.save(user);
  }

  async toggleStar(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.isStar = !user.isStar;
    if (user.isStar) user.level = VendorLevel.STAR;
    return this.userRepo.save(user);
  }

  async updateStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    await this.userRepo.update(id, { stripeCustomerId });
  }

  async findValidatedVendeurs(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.VENDEUR, isValidated: true },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userRepo.find({ where: { role } });
  }
}
