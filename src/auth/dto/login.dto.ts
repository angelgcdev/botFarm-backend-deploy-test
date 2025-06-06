import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser un correo válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  password: string;
}
