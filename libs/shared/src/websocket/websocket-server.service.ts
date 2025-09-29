import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer, WebSocket, Data } from 'ws';
import { v4 as uuidv4 } from 'uuid';


import { WebsocketData, Html } from '../models/models.service';

export const Events = {
    connected: 'connected',
    job: 'job',
    alert: 'alert'
} as const
export type EventName = typeof Events[keyof typeof Events];

const MessageErrors = {
    clientNotFound: 'Client not found or inactive',
} as const
type MessageErrorName = typeof MessageErrors[keyof typeof MessageErrors];

@Injectable()
export abstract class WebsocketServerService implements OnModuleInit {
    protected wss: WebSocketServer;
    public internalIp: string;
    protected clients: Map<string, WebSocket>;

    constructor(port: number, internalIp: string) {
        this.wss = new WebSocketServer({ port: port || Number(process.env.PORT) || 3001 });
        this.internalIp = internalIp;
        this.clients = new Map();
    }

    async onModuleInit() {
        this.wss.on('connection', this.onConnection.bind(this));
    }

    async onConnection(ws: WebSocket) {
        const clientId = uuidv4();
        console.log('Client connected', clientId);
        this.addClient(clientId, ws);
        const connectMessage = {
            event: Events.connected,
            message: "you are connected to the server"
        }
        await this.sendMessage(ws, connectMessage);
        ws.on ('message', this.onMessage.bind(this, clientId))
        ws.on('close', () => {
            console.log('Client disconnected', clientId);
            this.removeClient(clientId);
        });
    }

    async onMessage(clientId: string, message: Data | Buffer): Promise<any> {
        try {
            const data = JSON.parse(message.toString());
            await this.handleMessage(clientId, data);
        } catch (err) {
            this.handleMessageError(message.toString(), err);
        }
    }

    async processMessage(data: WebsocketData): Promise<void> {
        switch (data.event) {
            case Events.alert:
                const message = data.message as Html;
                await this.notify(message.clientWebsocketId, message.response);
                break;
            case Events.job:
                break;
            default:
                throw new Error(`Unknown event: ${data.event}`);
        }
    }  


    public abstract handleMessage(websocketId: string, data: any): Promise<void>;

    async sendMessage(client: WebSocket, message: WebsocketData) {
        await client.send(JSON.stringify(message));
    }

    async notify(websocketId: string, message: any) { 
        const client = this.getClient(websocketId);
        if (client && client.readyState === WebSocket.OPEN) {
            const alertMessage = {
                event: Events.alert,
                message 
            }
            await this.sendMessage(client, alertMessage);
        } else {
            throw new Error(`${MessageErrors.clientNotFound} ${websocketId}`);
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

    protected handleMessageError(message: string, err: any) {
        const isOperationalError = err.message.startsWith(MessageErrors.clientNotFound)
        if (isOperationalError) {
            console.error(message, err);
            //ideally send to some DB or persist to some "dead-letter" topic (though it's not dead-letter by definition)
        } else {
            throw err;
        }

    }
}
