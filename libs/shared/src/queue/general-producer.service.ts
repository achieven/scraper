import { Injectable, OnModuleInit } from '@nestjs/common';
import { Producer } from 'kafkajs';

import { QueueService } from './queue.service';


@Injectable()
export abstract class GeneralProducerService implements OnModuleInit {
    protected abstract outputTopic: string;
    protected producer: Producer;

    constructor(protected readonly queueService: QueueService) {
        this.producer = this.queueService.myKafka.producer({
            retry: {
                retries: 3,
            }
        });
    }

    async onModuleInit() {
        console.log('Connecting producer');
        await this.producer.connect();
        console.log('Producer connected');
    }

    async send(topic: string, message: string) {
        console.log(new Date().toISOString(), 'Producing message, topic:',topic, ', message:', message);
        return await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
    }
}
