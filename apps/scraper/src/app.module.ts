import { Module } from '@nestjs/common';


import { AppService, MyWebsocketService } from './app.service';
import { QueueModule } from '../../../libs/shared/src/queue/queue.module';
import { WebsocketModule } from '../../../libs/shared/src/websocket/websocket.module';

@Module({
  imports: [QueueModule, WebsocketModule],
  providers: [
    AppService, 
    MyWebsocketService,
    {
      provide: 'TERMINATOR_PORT',
      useValue: 3002,
    },
  ],
})
export class AppModule {}
