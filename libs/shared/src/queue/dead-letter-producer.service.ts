import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaMessage, Producer } from 'kafkajs';

import { QueueService, Topics } from './queue.service';
import { GeneralProducerService } from './general-producer.service';


@Injectable()
export class DeadLetterProducerService extends GeneralProducerService implements OnModuleInit {
    protected outputTopic: string = Topics.deadLetter

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
