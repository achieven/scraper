import { Injectable, Inject } from '@nestjs/common';
import { Url, Html } from '../../../libs/shared/src/models/models.service';
import {
  Groups,
  QueueService,
  Topics,
} from '../../../libs/shared/src/queue/queue.service';
import { InitiatorWebsocketService } from '../../../libs/shared/src/websocket/initiator-websocket.service';
import { MessageProducerService } from '../../../libs/shared/src/queue/message-producer.service';
import { DeadLetterProducerService } from '../../../libs/shared/src/queue/dead-letter-producer.service';

@Injectable()
export class MyWebsocketService extends InitiatorWebsocketService {
  constructor(@Inject('INITIATOR_PORT') port: number, @Inject('TERMINATOR_PORT') terminatorPort: number) {
    super(port, terminatorPort);
  }

  async handleMessage(websocketId: string, data: any) {
    var a = 0
    await this.processMessage(websocketId, data);
  }
}

@Injectable()
export class AppService extends MessageProducerService {
  protected outputTopic: string = Topics.jobManager;
  protected groupId: string = Groups.webServer;

  constructor(protected readonly queueService: QueueService, protected readonly websocketService: MyWebsocketService, protected readonly deadLetterProducerService: DeadLetterProducerService) {
    super(queueService, deadLetterProducerService);
    this.websocketService.handleMessage = this.handleMessage.bind(this);
  }

  async create(body: Url) {//TODO delete this and the controller
    return await this.sendMessage(this.outputTopic, JSON.stringify(body));
  }

  isMessageBrokerMessage(data: any) {
    return data.event === 'job';
  }

  async handleMessage(websocketId: string, data: any) {
    await this.websocketService.processMessage(websocketId, data);
    if (this.isMessageBrokerMessage(data)) {
      await this.sendMessage(this.outputTopic, JSON.stringify({...data, websocket: websocketId, websocketId: this.websocketService.websocketId}));
    }
}

  async eachMessage(messageValue: string) {
    await this.consumeMessage(JSON.parse(messageValue) as Html);
  }
}
