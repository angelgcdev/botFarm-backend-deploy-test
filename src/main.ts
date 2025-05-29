import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo para la ruta /api
  app.setGlobalPrefix('api');

  //Habilitar validacion global
  app.useGlobalPipes(new ValidationPipe());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  //Para leer cookies el token jwt
  app.use(cookieParser());

  // Puerto dinámico para Railway o puerto 4000 local
  const port = process.env.PORT || 4000;
  await app.listen(port);

  // Mensaje de servidor levantado
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(
    `🚀 Server listening on ${isProduction ? 'Railway port' : `http://localhost:${port}`}`,
  );
}
bootstrap().catch((error) => console.error(error));
