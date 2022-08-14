import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Settings } from 'luxon';

async function bootstrap() {
  Settings.defaultZone = 'Asia/Shanghai';
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
