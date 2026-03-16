import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VolumeEnum } from '../../common/enums/volume.enum';

export class MissionOptionDto {
  @IsString()
  optionType: string;

  @IsOptional()
  @IsString()
  optionDetail?: string;

  @IsInt()
  @Min(0)
  price: number;
}

export class CreateMissionDto {
  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time format HH:MM',
  })
  startTime: string;

  @IsInt()
  @Min(2)
  durationHours: number;

  @IsString()
  @MinLength(5)
  address: string;

  @IsOptional()
  @IsString()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  @IsOptional()
  @IsString()
  addressPostalCode?: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  category: string;

  @IsEnum(VolumeEnum)
  volume: VolumeEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MissionOptionDto)
  options: MissionOptionDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;
}
