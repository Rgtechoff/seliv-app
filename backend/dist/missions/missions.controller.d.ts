import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { User } from '../users/entities/user.entity';
export declare class MissionsController {
    private readonly missionsService;
    constructor(missionsService: MissionsService);
    create(user: User, dto: CreateMissionDto): Promise<{
        data: import("./entities/mission.entity").Mission;
    }>;
    getMyMissions(user: User): Promise<{
        data: import("./entities/mission.entity").Mission[];
    }>;
    getAvailable(user: User): Promise<{
        data: {
            id: string;
            date: Date;
            startTime: string;
            durationHours: number;
            city: string;
            category: string;
            volume: import("../common/enums/volume.enum").VolumeEnum;
            totalPrice: number;
            status: import("../common/enums/mission-status.enum").MissionStatus;
        }[];
    }>;
    findOne(id: string, user: User): Promise<{
        data: null;
    } | {
        data: {
            id: string;
            date: Date;
            startTime: string;
            durationHours: number;
            address: string;
            city: string;
            category: string;
            volume: import("../common/enums/volume.enum").VolumeEnum;
            status: import("../common/enums/mission-status.enum").MissionStatus;
            totalPrice: number;
        };
    } | {
        data: import("./entities/mission.entity").Mission;
    }>;
    acceptMission(id: string, user: User): Promise<{
        data: import("./entities/mission.entity").Mission;
    }>;
    completeMission(id: string, user: User): Promise<{
        data: import("./entities/mission.entity").Mission;
    }>;
}
