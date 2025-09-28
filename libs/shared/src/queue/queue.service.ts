import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';


export const Topics = {
    deadLetter: 'dead-letter',
    jobManager: 'job-manager',
    scraper: 'scraper',
    final: 'final'
} as const 
export type TopicName = typeof Topics[keyof typeof Topics];

export const Groups = {
    jobManager: 'job-manager',
    scraper: 'scraper',
    webServer: 'web-server'
} as const 
export type GroupName = typeof Groups[keyof typeof Groups];

@Injectable()
export abstract class QueueService {
    protected kafka: Kafka;

    constructor(host: string | undefined, port: string | undefined) {
        const brokerUrl = `${host || 'localhost'}:${Number(port)|| 9092}`
        console.log("Creating Kafka with broker URL:", brokerUrl)
        this.kafka = new Kafka({
            brokers: [brokerUrl]
          })
        console.log("Kafka instance created successfully")
    }

    get myKafka() {
        return this.kafka;
    }
}
