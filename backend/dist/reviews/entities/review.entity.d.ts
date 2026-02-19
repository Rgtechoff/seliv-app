import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';
export declare class Review {
    id: string;
    missionId: string;
    mission: Mission;
    clientId: string;
    client: User;
    vendeurId: string;
    vendeur: User;
    rating: number;
    comment: string | null;
    isVisible: boolean;
    createdAt: Date;
}
