import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
require('dotenv').config();
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  require('newrelic');
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const LISTEN_PORT = 3004;
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const options = new DocumentBuilder()
    .setTitle('API orders microservice')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addTag('OrderMicroServices')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1', app, document);
  // SwaggerModule.setup('api/v1', app, createDocument(app));
  await app.listen(process.env.PORT || LISTEN_PORT);
}
bootstrap();
