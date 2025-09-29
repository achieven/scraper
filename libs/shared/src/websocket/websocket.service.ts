import { Injectable } from '@nestjs/common';


export interface HtmlMessage  {
    response: string,
    clientWebsocketId: string,
}

export interface WebsocketData {
    event: EventName,
    message: string | HtmlMessage
}

export const Events = {
    connected: 'connected',
    job: 'job',
    alert: 'alert'
} as const
export type EventName = typeof Events[keyof typeof Events];

export const MessageErrors = {
    clientNotFound: 'Client not found or inactive',
} as const

@Injectable()
export class WebsocketService {}
