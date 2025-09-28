import { Injectable } from '@nestjs/common';


import { EventName } from '../websocket/websocket.service';

export interface Url  {
    url: string,
    clientWebsocketId: string,
    initiatorWebsocketId: string,
}

export interface WebsocketData {
    event: EventName,
    message: any
}

@Injectable()
export class ModelsService {}
