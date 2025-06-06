import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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

  // Puerto dinámico para Railway o puerto 4000 local
  const port = parseInt(process.env.PORT ?? '4000', 10);

  await app.listen(port);

  // Mensaje de servidor levantado
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(
    `🚀 Server listening on ${isProduction ? 'Railway port' : `http://localhost:${port}`}`,
  );
}
bootstrap().catch((error) => console.error(error));
