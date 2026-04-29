import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { AppExceptionFilter } from '../src/shared/filters/app-exception.filter';

const server = express();

let ready: Promise<void> | null = null;

function bootstrap() {
  if (!ready) {
    ready = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { logger: false });

      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ limit: '10mb', extended: true }));

      const allowedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
      app.enableCors({
        origin: (origin, callback) => {
          if (!origin || origin === allowedOrigin || origin.endsWith('.vercel.app')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true
      });

      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
      );
      app.useGlobalFilters(new AppExceptionFilter());

      await app.init();
    })();
  }
  return ready;
}

export default async (req: express.Request, res: express.Response) => {
  await bootstrap();
  server(req, res);
};
