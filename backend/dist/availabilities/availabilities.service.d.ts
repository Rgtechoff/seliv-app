import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';
export declare class AvailabilitiesService {
    private readonly repo;
    constructor(repo: Repository<Availability>);
    findByUser(userId: string): Promise<Availability[]>;
    upsert(userId: string, dto: UpsertAvailabilityDto): Promise<Availability>;
    remove(id: string, userId: string): Promise<void>;
    isVendeurAvailable(userId: string, date: string, startTime: string, durationHours: number): Promise<boolean>;
}
