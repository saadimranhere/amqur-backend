import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Request validation (DTO enforcement)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global error formatter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global success response formatter
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS for widget + frontend
  // CORS for widget + dealership websites
  app.enableCors({
    origin: true, // allow any dealership domain
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });


  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
