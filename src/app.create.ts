import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './infrastructure/core/http/filters/http-exception.filter';
import { SuccessResponseInterceptor } from './infrastructure/core/http/interceptors/success-response.interceptor';

export function initializeApp(app: INestApplication): void {
  const expressInstance = app.getHttpAdapter().getInstance() as {
    disable: (header: string) => void;
  };
  expressInstance.disable('x-powered-by');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FinSight API')
    .setDescription(
      'Backend API untuk FinSight — Platform AI Coach Keuangan Personal',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
