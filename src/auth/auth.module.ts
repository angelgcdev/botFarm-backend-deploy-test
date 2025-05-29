import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config'; // Importa el módulo y servicio de configuración para leer variables desde .env
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService], // Inyectamos el servicio para leer variables del .env
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'secreto_super_seguro',
        // Usamos la variable JWT_SECRET del archivo .env como clave secreta para firmar tokens
        // Si no existe, usamos un valor por defecto (no recomendado en producción)

        signOptions: { expiresIn: '24h' }, //Tiempo de expiracion del token
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard], //Exportamos el AuthService para usarlo en otros modulos
})
export class AuthModule {}
