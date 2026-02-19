import { VolumeEnum } from '../../common/enums/volume.enum';
export declare class MissionOptionDto {
    optionType: string;
    optionDetail?: string;
    price: number;
}
export declare class CreateMissionDto {
    date: string;
    startTime: string;
    durationHours: number;
    address: string;
    city: string;
    category: string;
    volume: VolumeEnum;
    options: MissionOptionDto[];
}
