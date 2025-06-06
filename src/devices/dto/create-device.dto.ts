import { IsEmail, IsArray, IsInt, IsEnum } from 'class-validator';
import { SocialNetworkType } from '@prisma/client';

export class CreateDeviceDto {
  @IsEmail()
  email: string;

  @IsInt()
  dispositivo_id: number;

  @IsArray()
  @IsEnum(SocialNetworkType, { each: true }) // <- Valida cada item como un enum válido
  items: SocialNetworkType[]; // redes sociales  como "tiktok", "facebook"
}
