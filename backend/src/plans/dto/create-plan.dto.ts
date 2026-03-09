import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsEnum(['monthly', 'yearly'])
  @IsOptional()
  billingPeriod?: 'monthly' | 'yearly';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsInt()
  @Min(0)
  @IsOptional()
  hourlyDiscountCents?: number;

  @IsBoolean()
  @IsOptional()
  canAccessStar?: boolean;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  priorityLevel?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxMissionsPerMonth?: number | null;
}
