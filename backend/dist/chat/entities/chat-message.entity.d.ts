import { Mission } from '../../missions/entities/mission.entity';
import { User } from '../../users/entities/user.entity';
export declare class ChatMessage {
    id: string;
    missionId: string;
    mission: Mission;
    senderId: string;
    sender: User;
    content: string;
    isPreset: boolean;
    isFlagged: boolean;
    isSystem: boolean;
    createdAt: Date;
}
