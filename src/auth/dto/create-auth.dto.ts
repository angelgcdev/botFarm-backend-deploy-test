import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'El email no puede esta vacio' })
  @IsEmail({}, { message: 'El email debe ser una dirección de correo valida' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña no puede esta vacia' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(Role, {
    message:
      'El rol deber ser uno de los siguientes valores: ADMINISTADOR, PERSONAL',
  })
  role: Role;
}
