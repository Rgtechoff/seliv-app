import { User } from '../../users/entities/user.entity';
export declare class Availability {
    id: string;
    userId: string;
    user: User;
    dayOfWeek: number | null;
    startTime: string | null;
    endTime: string | null;
    dateSpecific: Date | null;
    isAvailable: boolean;
}
