import { User } from '../users/entities/user.entity';
import { AvailabilitiesService } from './availabilities.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';
export declare class AvailabilitiesController {
    private readonly service;
    constructor(service: AvailabilitiesService);
    getMine(user: User): Promise<{
        data: import("./entities/availability.entity").Availability[];
    }>;
    getByUser(userId: string): Promise<{
        data: import("./entities/availability.entity").Availability[];
    }>;
    upsert(user: User, dto: UpsertAvailabilityDto): Promise<{
        data: import("./entities/availability.entity").Availability;
    }>;
    remove(user: User, id: string): Promise<{
        data: {
            success: boolean;
        };
    }>;
}
