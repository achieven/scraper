import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaMessage, Producer } from 'kafkajs';

import { DeadLetterProducerService } from './dead-letter-producer.service';
import { GeneralProducerService } from './general-producer.service';
import { MessageQueueService } from './message-queue.service';

@Injectable()
export abstract class MessageProducerService extends GeneralProducerService implements OnModuleInit {
    protected abstract outputTopic: string;

    constructor(protected readonly queueService: MessageQueueService, protected readonly deadLetterProducerService: DeadLetterProducerService) {
       super(queueService);
    }

    protected async consumeMessage(messageData: any): Promise<void> {}

    async sendMessage(topic: string, message: string) {
        try {
            await this.send(topic, message);
        } catch (err) {
            await this.deadLetterProducerService.sendDeadLetter(topic, null, {value: JSON.parse(message)}, err)
        }
    }
}

@Injectable()
export class ConcreteMessageProducerService extends MessageProducerService {
    protected outputTopic: string = '';
}
