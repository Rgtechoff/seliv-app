import { IsArray, IsString } from 'class-validator';

export class ReorderPlansDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
