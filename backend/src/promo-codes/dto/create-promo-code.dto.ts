import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsEnum(['percent', 'fixed', 'free'])
  discountType: 'percent' | 'fixed' | 'free';

  @IsInt()
  @Min(0)
  @Max(10000000)
  discountValue: number; // % for percent, centimes for fixed, ignored for free

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromoCodeDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsEnum(['percent', 'fixed', 'free'])
  discountType?: 'percent' | 'fixed' | 'free';

  @IsOptional()
  @IsInt()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
