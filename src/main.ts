import { json, urlencoded } from 'express';
import { AppModule } from './modules/app.module';
// import { ExceptionsFilter } from './filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // const config = new DocumentBuilder()
  //   .setTitle('Yasuke Auth App')
  //   .setDescription('The Yasuke Auth App API documentation')
  //   .setVersion('1.0')
  //   .addTag('yasuke')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      validatorPackage: require('@nestjs/class-validator'),
      transformerPackage: require('@nestjs/class-transformer'),
    }),
  );
  app.setGlobalPrefix('/api');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // app.useGlobalFilters(new ExceptionsFilter());

  await app.listen(process.env.PORT, () => {
    console.log(`app server running on PORT ${process.env.PORT}`);
  });
}
bootstrap();
