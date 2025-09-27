import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { WebsocketService } from './websocket.service';

@Injectable()
export abstract class InitiatorWebsocketService extends WebsocketService implements OnModuleInit {
    protected terminatorWebSocket: WebSocket;
    public websocketId: string = '';
    constructor(port: number, @Inject('TERMINATOR_PORT') terminatorPort: number) {
        super(port)
        console.log(`Connecting to terminator server at ws://${process.env.TERMINATOR_HOST}:${terminatorPort}`);
        this.terminatorWebSocket = new WebSocket(`ws://${process.env.TERMINATOR_HOST}:${terminatorPort}`);
        this.terminatorWebSocket.onopen = () => {
            console.log('Connected to terminator server.');
        };

        this.terminatorWebSocket.onclose = () => {
            this.removeClient(this.websocketId);
            //TODO send message to add a new web-server and replace existing one
            //TODO also on SIGINT/SIGTERM gracefully send message to remove and replace existing one
        }
          
        this.terminatorWebSocket.onmessage = (event) => {
           super.onMessage('', event.data.toString());
        }
    }

    async processMessage(websocketId: string, data: any): Promise<void> {
        if (data.event === 'connected') {
            this.websocketId = data.message;
        } else if(data.event === 'job') {
            
        } else if (data.event === 'alert') {
            this.notify(data.message.websocket, data.message);
        }
    }
   
}
