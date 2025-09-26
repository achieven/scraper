import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  process.on('SIGINT', async () => {
    console.log('Shutting down Scraper Service...');
    await app.close();
    process.exit(0);
  });
}
bootstrap()
  .catch((error) => {
    console.error('Failed to start Web Server:', error);
    process.exit(1);
  });
