import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from '../../../libs/shared/src/queue/queue.module';
import { ModelsModule } from '../../../libs/shared/src/models/models.module';

@Module({
  imports: [QueueModule, ModelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
