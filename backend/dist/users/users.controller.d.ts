import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateMe(user: User, dto: UpdateUserDto): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getPublicProfile(id: string): Promise<{
        data: null;
    } | {
        data: {
            id: string;
            firstName: string;
            lastInitial: string;
            avatarUrl: string | null;
            bio: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
        };
    }>;
    findAll(): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    validateVendeur(id: string): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    toggleStar(id: string): Promise<{
        data: {
            id: string;
            email: string;
            role: UserRole;
            firstName: string;
            lastName: string;
            phoneEncrypted: string | null;
            companyName: string | null;
            siret: string | null;
            zones: string[];
            categories: string[];
            level: import("../common/enums/vendor-level.enum").VendorLevel | null;
            isStar: boolean;
            isValidated: boolean;
            bio: string | null;
            avatarUrl: string | null;
            stripeCustomerId: string | null;
            canModerate: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
