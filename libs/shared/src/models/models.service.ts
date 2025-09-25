import { Injectable } from '@nestjs/common';

export interface Url  {
    url: string
}

export interface Html {
    html: string,
    websocket: string
}

@Injectable()
export class ModelsService {}
