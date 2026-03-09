import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ServiceCategory, PriceType } from '../entities/service-item.entity';

export class UpdateServiceItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['preparation', 'etiquetage', 'conditionnement', 'creation_compte', 'script', 'autre'])
  @IsOptional()
  category?: ServiceCategory;

  @IsInt()
  @Min(0)
  @IsOptional()
  priceCents?: number;

  @IsEnum(['fixed', 'per_unit'])
  @IsOptional()
  priceType?: PriceType;

  @IsString()
  @IsOptional()
  unitLabel?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  minQuantity?: number;

  @IsInt()
  @IsOptional()
  maxQuantity?: number | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  legacyKey?: string;
}
