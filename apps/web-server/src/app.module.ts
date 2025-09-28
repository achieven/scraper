import { Module } from '@nestjs/common';


import { AppService, MyWebsocketService } from './app.service';
import { QueueModule } from '../../../libs/shared/src/queue/queue.module';
import { ModelsModule } from '../../../libs/shared/src/models/models.module';
import { WebsocketModule } from '../../../libs/shared/src/websocket/websocket.module';

@Module({
  imports: [QueueModule, ModelsModule, WebsocketModule],
  providers: [
    AppService,
    MyWebsocketService,
    {
      provide: 'INITIATOR_PORT',
      useValue: 3001,
    },
    {
      provide: 'TERMINATOR_PORT',
      useValue: 3002,
    },
  ],
  exports: [],
})
export class AppModule {}
