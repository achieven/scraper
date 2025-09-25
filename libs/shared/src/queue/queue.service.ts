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


export class QueueService {
    private kafka: Kafka;
   


    constructor() {
        this.kafka = new Kafka({
            brokers: [`${process.env.KAFKA_HOST || 'localhost'}:9092`]
          })
    }

    getKafka() {
        return this.kafka;
    }
}
