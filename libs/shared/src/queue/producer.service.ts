import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaMessage, Producer } from 'kafkajs';

import { QueueService, Topics } from './queue.service';


@Injectable()
export abstract class ProducerService implements OnModuleInit {
    protected abstract outputTopic: string;
    protected producer: Producer;

    constructor(protected readonly queueService: QueueService) {
        this.producer = this.queueService.getKafka().producer({
            retry: {
                retries: 3,
            }
        });
    }

    async onModuleInit() {
        await this.producer.connect();
    }

    protected async consumeMessage(messageData: any): Promise<void> {}

    async sendMessage(topic: string, message: string) {
        try {
            await this.send(topic, message);
        } catch (error) {
            await this.sendDeadLetter(topic, null, {value: JSON.parse(message)})
        }
    }

    async sendDeadLetter(topic: string, partition: number | null, message: KafkaMessage | any) {
        await this.send(Topics.deadLetter, JSON.stringify({
            value: message.value.toString(), 
            offset: message.offset,
            topic,
            partition
        }))
    }

    async send(topic: string, message: string) {
        return await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
    }
}

@Injectable()
export class ConcreteProducerService extends ProducerService {
    protected outputTopic: string = '';
    constructor(protected readonly queueService: QueueService) {
        super(queueService);
    }
}
