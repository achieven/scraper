import { Injectable, OnModuleInit } from '@nestjs/common';


import { WebsocketService } from './websocket.service';

@Injectable()
export abstract class TerminatorWebsocketService extends WebsocketService implements OnModuleInit {
    constructor(port: number) {
        super(port)
    }

    async handleMessage(websocketId: string, data: any): Promise<void> {}
   
}
