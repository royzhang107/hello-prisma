import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const instance = winston.createLogger({
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.printf(
            (lf) =>
              `[${lf.timestamp}] [${
                lf.context ?? (process.env.npm_package_name || '')
              }] [${lf.level}] ${lf.ms} ${lf.message?.replace(
                /(\r\n|\n|\r)/gm,
                '',
              )}`,
          ),
        ),
      }),
      // other transports...
    ],
    // other options
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // disableErrorMessages: true,
      forbidUnknownValues: false,
    }),
  );

  app.use('/webhook/vehicle-events', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const server = await app.listen(3000);

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
    process.on(signal, () => {
      console.info(`${signal} signal received.`);
      server.close(() => {
        console.log('server process ended.');
      });
    }),
  );
}
bootstrap();
