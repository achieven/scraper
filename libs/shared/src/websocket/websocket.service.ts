import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

export const Events = {
    connected: 'connected',
    job: 'job',
    alert: 'alert'
} as const
export type EventName = typeof Events[keyof typeof Events];

@Injectable()
export abstract class WebsocketService implements OnModuleInit {
    protected wss: WebSocketServer;
    protected clients: Map<string, WebSocket>;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port: port || Number(process.env.PORT) || 3001 });
        this.clients = new Map();
    }

    async onModuleInit() {
        this.wss.on('connection', this.onConnection.bind(this));
    }

    async onConnection(ws: WebSocket) {
        console.log('Client connected');
        const clientId = uuidv4();
        this.addClient(clientId, ws);
        // this.handleHeartbeatAndIdle(ws);
        ws.send(JSON.stringify({
            event: 'connected',
            message: clientId
        }));
        ws.on ('message', this.onMessage.bind(this, clientId))
        ws.on('close', () => {
            this.removeClient(clientId);
        });
    }

    async onMessage(clientId: string, message: string): Promise<any> {
        const data = JSON.parse(message.toString());
        await this.handleMessage(clientId, data);
    }


    public abstract handleMessage(websocketId: string, data: any): Promise<void>;

    async notify(websocketId: string, message: any) { 
        const client = this.getClient(websocketId);
        if (client && client.readyState === WebSocket.OPEN) {
            await client.send(JSON.stringify({
                event: Events.alert,
                message 
            }));
        } else {
            throw new Error(`Client not found or inactive ${websocketId}`);
        }
    }

    protected addClient(websocketId: string, websocket: WebSocket): void {
        this.clients.set(websocketId, websocket);
    }

    protected getClient(websocketId: string): WebSocket | undefined {
        return this.clients.get(websocketId);
    }

    protected removeClient(websocketId: string): void {
        this.clients.delete(websocketId);
    }
}
