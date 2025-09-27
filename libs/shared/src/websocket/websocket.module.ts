import { Module } from '@nestjs/common';
import {  } from './websocket.service';
import { InitiatorWebsocketService } from './initiator-websocket.service';
import { TerminatorWebsocketService } from './terminator-websocket.service';

@Module({
  providers: [],
  exports: []
})
export class WebsocketModule {}
