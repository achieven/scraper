import { Injectable } from '@nestjs/common';

export interface Message {
    data: Url | Html
}

export interface UrlMessage {
    data: Url
}

export interface IsValidMessage {
    isValid: boolean
}

export interface HtmlMessage {

}

export interface Url  {
    url: string
}

export interface Html {
    html: string,
    websocket: string
}

@Injectable()
export class ModelsService {}
