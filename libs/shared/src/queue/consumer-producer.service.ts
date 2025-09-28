import { Injectable } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';

import { QueueService } from './queue.service';
import { ConcreteMessageProducerService } from './message-producer.service';
import { ConsumerService } from './consumer.service';
import { DeadLetterProducerService } from './dead-letter-producer.service';
import { MessageQueueService } from './message-queue.service';

@Injectable()
export abstract class ConsumerProducerService extends ConsumerService {
    protected abstract outputTopic: string;
    protected abstract inputTopic: string;
    protected abstract groupId: string;

    constructor(
      protected readonly queueService: MessageQueueService, 
      protected readonly producerService: ConcreteMessageProducerService, 
      protected readonly deadLetterProducerService: DeadLetterProducerService
    ) {
      super(queueService, deadLetterProducerService);
    }

    protected async produceMessage(messageValue: any): Promise<void> {
      await this.producerService.sendMessage(this.outputTopic, messageValue);
    }

    protected async handleMessage(messageValue: string): Promise<void> {
      const response = await super.handleMessage(messageValue);
      const newValue = {response, ...JSON.parse(messageValue)}
      await this.produceMessage(JSON.stringify(newValue));
    }
}
