import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  video_url: string;

  @IsInt()
  views_count: number;

  @IsBoolean()
  liked?: boolean;

  @IsBoolean()
  saved?: boolean;

  @IsString()
  comment?: string;
}
