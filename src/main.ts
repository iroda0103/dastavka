import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get the logger service from the application context
  const logger = app.get(CustomLoggerService);

  // Set the logger as the application logger
  app.useLogger(logger);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}
bootstrap();
