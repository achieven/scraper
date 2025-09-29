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
      provide: 'WEB_SOCKET_PORT',
      useValue: 3001,
    },
    {
      provide: 'MY_INTERNAL_IP',
      useValue: process.env.MY_INTERNAL_IP || 'localhost'
    }
  ],
  exports: [],
})
export class AppModule {}
