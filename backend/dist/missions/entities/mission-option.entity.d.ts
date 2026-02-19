import { Mission } from './mission.entity';
export declare class MissionOption {
    id: string;
    missionId: string;
    mission: Mission;
    optionType: string;
    optionDetail: string | null;
    price: number;
}
