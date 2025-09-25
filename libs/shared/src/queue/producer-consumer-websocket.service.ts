import { Injectable } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

import { ProducerConsumerService } from './producer-consumer.service';


@Injectable()
export abstract class ProducerConsumerWebsocketService extends ProducerConsumerService {
    protected wss: WebSocketServer = new WebSocketServer({ port: Number(process.env.PORT) || 3001 });;
    protected clients: Map<string, WebSocket> = new Map();
    
    async onModuleInit() {
        super.onModuleInit();
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('Client connected');
            const uuid = uuidv4();
            this.clients.set(uuid, ws);
            // this.handleHeartbeatAndIdle(ws);
            ws.on ('message', async (message: string) => {
                const data = JSON.parse(message.toString());
                await this.sendMessage(this.outputTopic, JSON.stringify({...data, websocket: uuid}));
            });
        });
        
    }

    async notify(client: WebSocket, message: any) { 
        if (client && client.readyState === WebSocket.OPEN) {
            await client.send(JSON.stringify({
                event: 'alert',
                message 
            }));
        } else {
            throw new Error('Client not found');
        }
    }
}
