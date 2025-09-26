import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

export const Topics = {
    deadLetter: 'dead-letter',
    jobManager: 'job-manager',
    scraper: 'scraper',
    final: 'final'
} as const 
type Topics = typeof Topics[keyof typeof Topics];

export const Groups = {
    jobManager: 'job-manager',
    scraper: 'scraper',
    webServer: 'web-server'
} as const 
type Groups = typeof Groups[keyof typeof Groups];

@Injectable()
export class QueueService {
    private kafka: Kafka;
   


    constructor() {
        const brokerUrl = `${process.env.KAFKA_HOST || 'localhost'}:${process.env.KAFKA_PORT || '9092'}`
        console.log("Creating Kafka with broker URL:", brokerUrl)
        this.kafka = new Kafka({
            brokers: [brokerUrl]
          })
        console.log("Kafka instance created successfully")
    }

    getKafka() {
        return this.kafka;
    }
}
