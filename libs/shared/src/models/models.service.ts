import { Injectable } from '@nestjs/common';

export interface Url  {
    url: string,
    websocket: string,
    websocketId: string
}

export interface Html {
    html: string,
    websocket: string
}

@Injectable()
export class ModelsService {}
