import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';


import { WebsocketData } from '../models/models.service';

@Injectable()
export abstract class WebsocketClientService {
    protected servers: Map<string, WebSocket>;
    protected port: number;
    public websocketId: string = '';

    constructor(port: number) {
        this.port = port;
        this.servers = new Map();
    }

    async getConnectedServer(host: string) {
        let server = this.getServer(host);
        if (server && server.readyState === WebSocket.OPEN) {
            return server;
        } else {
            return await this.connect(host);
        }
    }

    async connect(host: string): Promise<WebSocket> {
        const thisConnection = await new Promise<WebSocket>((resolve, reject) => {
            const connection = new WebSocket(`ws://${host}:${this.port}`);
            connection.onopen = () => {
                console.log('Connected to server', host);
                this.servers.set(host, connection);
                resolve(connection);
            };

            connection.onerror = (err) => {
                reject(err.error)
            }
        });

        thisConnection.onclose = () => {
            console.log('Disconnected from server', host);
            this.removeServer(host);
        }
        
        thisConnection.onmessage = async (event) => {
            console.log('Received message from server', host, event.data);
        }

        return thisConnection;
    }

    async sendMessage(host: string, data: WebsocketData) {
        const server = await this.getConnectedServer(host);
        await server.send(JSON.stringify(data));
    }

    protected removeServer(host: string) {
        this.servers.delete(host);
    }

    protected addServer(host: string, connection: WebSocket) {
        this.servers.set(host, connection);
    }

    protected getServer(host: string) {
        return this.servers.get(host);
    }
}
