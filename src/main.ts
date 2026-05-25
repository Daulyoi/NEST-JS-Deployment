import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { initializeApp } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  initializeApp(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`FinSight backend running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
