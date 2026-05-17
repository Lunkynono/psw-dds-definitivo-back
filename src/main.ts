import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './shared/filters/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
  const config = app.get(ConfigService);

  const configuredOrigin = config.get<string>('FRONTEND_ORIGIN');
  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(configuredOrigin ? configuredOrigin.split(',').map((origin) => origin.trim()) : [])
  ]);
  app.enableCors({
    origin: [...allowedOrigins],
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(config.get<number>('PORT') ?? 3000);
}

bootstrap();
