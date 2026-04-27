import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();

let ready: Promise<void> | null = null;

function bootstrap() {
  if (!ready) {
    ready = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { logger: false });

      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ limit: '10mb', extended: true }));

      app.enableCors({
        origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
        credentials: true
      });

      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
      );

      await app.init();
    })();
  }
  return ready;
}

export default async (req: express.Request, res: express.Response) => {
  await bootstrap();
  server(req, res);
};
