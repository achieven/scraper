import { Injectable } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';

import { QueueService } from './queue.service';
import { ConcreteProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';

@Injectable()
export abstract class ConsumerProducerService extends ConsumerService {
    protected abstract outputTopic: string;
    protected abstract inputTopic: string;
    protected abstract groupId: string;

    constructor(protected readonly queueService: QueueService, protected readonly producerService: ConcreteProducerService) {
      super(queueService);
    }

    protected async produceMessage(messageValue: any): Promise<void> {
      await this.producerService.sendMessage(this.outputTopic, messageValue);
    }

    protected async produceDeadLetter(topic: string, partition: number | null, message: KafkaMessage): Promise<void> {
      await this.producerService.sendDeadLetter(topic, partition, message);
    }
}
