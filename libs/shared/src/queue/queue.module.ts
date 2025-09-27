import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { DeadLetterProducerService } from './dead-letter-producer.service';
import { ConcreteMessageProducerService } from './message-producer.service';


@Module({
  exports: [QueueService, DeadLetterProducerService, ConcreteMessageProducerService],
  providers: [QueueService, DeadLetterProducerService, ConcreteMessageProducerService]
})
export class QueueModule {}
