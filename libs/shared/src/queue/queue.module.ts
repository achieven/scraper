import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ConcreteProducerService } from './producer.service';
import { ConcreteConsumerService } from './consumer.service';


@Module({
  exports: [QueueService, ConcreteProducerService, ConcreteConsumerService],
  providers: [QueueService, ConcreteProducerService, ConcreteConsumerService]
})
export class QueueModule {}
