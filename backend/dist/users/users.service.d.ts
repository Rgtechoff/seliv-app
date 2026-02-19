import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    create(data: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        companyName?: string;
        siret?: string;
    }): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    validateVendeur(id: string): Promise<User>;
    toggleStar(id: string): Promise<User>;
    updateStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
    findValidatedVendeurs(): Promise<User[]>;
    findAll(): Promise<User[]>;
    findByRole(role: UserRole): Promise<User[]>;
}
