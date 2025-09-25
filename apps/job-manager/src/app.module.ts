import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { QueueModule } from '../../../libs/shared/src/queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [AppService],
})
export class AppModule {}
