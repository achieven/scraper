import { Injectable } from '@nestjs/common';
import { Url, Html } from '../../../libs/shared/src/models/models.service';
import {
  Groups,
  QueueService,
  Topics,
} from '../../../libs/shared/src/queue/queue.service';
import { ProducerConsumerWebsocketService } from '../../../libs/shared/src/queue/producer-consumer-websocket.service';
import { ConcreteConsumerService } from '../../../libs/shared/src/queue/consumer.service';

@Injectable()
export class AppService extends ProducerConsumerWebsocketService {
  protected outputTopic: string = Topics.jobManager;
  protected inputTopic: string = Topics.final;
  protected groupId: string = Groups.webServer;

  constructor(
    protected readonly queueService: QueueService,
    protected readonly consumerService: ConcreteConsumerService,
  ) {
    super(queueService, consumerService);
    this.consumerService.eachMessage = this.eachMessage.bind(this);
    this.consumerService.onInit(this.groupId, this.inputTopic);
  }

  async create(body: Url) {
    return await this.sendMessage(this.outputTopic, JSON.stringify(body));
  }

  async consumeMessage(messageData: Html) {
    await this.notify(messageData.websocket, messageData);
  }

  async eachMessage(messageValue: string) {
    await this.consumeMessage(JSON.parse(messageValue) as Html);
  }
}
