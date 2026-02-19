import { UserRole } from '../../common/enums/user-role.enum';
import { VendorLevel } from '../../common/enums/vendor-level.enum';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneEncrypted: string | null;
    companyName: string | null;
    siret: string | null;
    zones: string[];
    categories: string[];
    level: VendorLevel | null;
    isStar: boolean;
    isValidated: boolean;
    bio: string | null;
    avatarUrl: string | null;
    stripeCustomerId: string | null;
    canModerate: boolean;
    createdAt: Date;
    updatedAt: Date;
}
