import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HistoryStatus } from '@prisma/client';

export class CreateHistoryDto {
  @IsInt()
  device_id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsInt()
  @Min(0)
  total_views: number;

  @IsBoolean()
  liked: boolean;

  @IsBoolean()
  video_saved: boolean;

  @IsOptional()
  @IsString()
  commented?: string;

  @IsOptional()
  @Type(() => Date) // transforma el input a Date si viene como string
  @IsDate()
  finished_at?: Date;

  @IsOptional()
  @IsEnum(HistoryStatus)
  status?: HistoryStatus;
}
