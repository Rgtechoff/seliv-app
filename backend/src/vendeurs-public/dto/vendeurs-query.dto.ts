import { IsOptional, IsString, IsIn, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class VendeursQueryDto {
  @IsOptional()
  @IsString()
  categories?: string; // "mode,tech" → split(',')

  @IsOptional()
  @IsString()
  zones?: string; // "Paris,Lyon" → split(',')

  @IsOptional()
  @IsString()
  level?: string; // "star,confirme" → split(',')

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsIn(['rating', 'missions', 'recent'])
  sort?: 'rating' | 'missions' | 'recent';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
