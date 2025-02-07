import { NestFactory } from '@nestjs/core';
import * as process from 'node:process';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(process.env.API_PREFIX);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
