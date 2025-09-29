import { Injectable } from '@nestjs/common';


import { EventName } from '../websocket/websocket-server.service';

export interface Url  {
    url: string
}

export interface Html  {
    response: string,
    clientWebsocketId: string,
}

export interface WebsocketData {
    event: EventName,
    message: string | Html
}

export interface QueueMessageUrl extends Url {
    clientWebsocketId: string,
    internalIp: string,
}

@Injectable()
export class ModelsService {}
