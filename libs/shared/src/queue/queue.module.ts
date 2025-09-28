import { Module } from '@nestjs/common';
import { DeadLetterProducerService, DeadLetterQueueService } from './dead-letter-producer.service';
import { ConcreteMessageProducerService } from './message-producer.service';
import { MessageQueueService } from './message-queue.service';



@Module({
  exports: [MessageQueueService, DeadLetterQueueService, DeadLetterProducerService, ConcreteMessageProducerService],
  providers: [MessageQueueService, DeadLetterQueueService, DeadLetterProducerService, ConcreteMessageProducerService]
})
export class QueueModule {}
