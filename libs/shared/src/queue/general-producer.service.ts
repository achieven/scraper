import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaMessage, Producer } from 'kafkajs';

import { QueueService, Topics } from './queue.service';
import { DeadLetterProducerService } from './dead-letter-producer.service';


@Injectable()
export abstract class GeneralProducerService implements OnModuleInit {
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
        console.log('Producer connected');
    }

    async send(topic: string, message: string) {
        return await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
    }
}

// @Injectable()
// export class ConcreteProducerService extends ProducerService {
//     protected outputTopic: string = '';
//     constructor(protected readonly queueService: QueueService, protected readonly deadLetterProducerService: DeadLetterProducerService) {
//         super(queueService, deadLetterProducerService);
//     }
// }
