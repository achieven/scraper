import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';


import { WebsocketService, Events } from './websocket.service';
import { WebsocketData } from '../models/models.service';

@Injectable()
export abstract class InitiatorWebsocketService extends WebsocketService implements OnModuleInit {
    protected terminatorWebSocket: WebSocket;
    public websocketId: string = '';
    constructor(port: number, @Inject('TERMINATOR_PORT') terminatorPort: number) {
        super(port)
        const terminatorHost = process.env.TERMINATOR_HOST || 'localhost';
        console.log(`Connecting to terminator server at ws://${terminatorHost}:${terminatorPort}`);
        this.terminatorWebSocket = new WebSocket(`ws://${terminatorHost}:${terminatorPort}`);
        this.terminatorWebSocket.onopen = () => {
            console.log('Connected to terminator server.');
        };

        this.terminatorWebSocket.onclose = () => {
            this.removeClient(this.websocketId);
            //TODO send message to add a new web-server and replace existing one
            //TODO also on SIGINT/SIGTERM gracefully send message to remove and replace existing one
        }
          
        this.terminatorWebSocket.onmessage = (event) => {
           super.onMessage('', event.data);
        }
    }



    async processMessage(websocketId: string, data: WebsocketData): Promise<void> {
        const event = data.event;
        if (event === Events.connected) {
            this.websocketId = data.message;
        } else if (event === Events.alert) {
            await this.notify(data.message.websocketId, data.message);
        } if(event === Events.job) {
            
        } 
    }  
}

process.on('SIGINT', async () => {
    // await this.terminatorWebSocket.close();
});
