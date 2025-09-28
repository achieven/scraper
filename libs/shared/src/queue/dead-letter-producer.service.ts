import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';


import { QueueService, Topics } from './queue.service';
import { GeneralProducerService } from './general-producer.service';

@Injectable()
export class DeadLetterQueueService extends QueueService {
    constructor() {
        super(process.env.DEAD_LETTER_HOST, process.env.DEAD_LETTER_PORT);
    }
}

@Injectable()
export class DeadLetterProducerService extends GeneralProducerService implements OnModuleInit {
    protected outputTopic: string = Topics.deadLetter

    constructor(protected readonly queueService: DeadLetterQueueService) {
        super(queueService);
    }

    async sendDeadLetter(topic: string, partition: number | null, message: KafkaMessage | any, err: any) {
        await this.send(this.outputTopic, JSON.stringify({
            value: message.value.toString(), 
            offset: message.offset,
            topic,
            partition,
            err: err.stack
        }))
    }
}

// @Injectable()
// export class ConcreteDeadLetterProducerService extends DeadLetterProducerService {}
