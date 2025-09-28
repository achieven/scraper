import { Injectable, Inject } from '@nestjs/common';
import { Url, Html } from '../../../libs/shared/src/models/models.service';
import {
  Groups,
  TopicName,
  GroupName,
  Topics,
} from '../../../libs/shared/src/queue/queue.service';
import { InitiatorWebsocketService } from '../../../libs/shared/src/websocket/initiator-websocket.service';
import { MessageProducerService } from '../../../libs/shared/src/queue/message-producer.service';
import { DeadLetterProducerService } from '../../../libs/shared/src/queue/dead-letter-producer.service';
import { MessageQueueService } from '../../../libs/shared/src/queue/message-queue.service';
import { EventName, Events } from '../../../libs/shared/src/websocket/websocket.service';

@Injectable()
export class MyWebsocketService extends InitiatorWebsocketService {
  constructor(@Inject('INITIATOR_PORT') port: number, @Inject('TERMINATOR_PORT') terminatorPort: number) {
    super(port, terminatorPort);
  }

  async handleMessage(websocketId: string, data: any) {}
}


@Injectable()
export class AppService extends MessageProducerService {
  protected outputTopic: TopicName = Topics.jobManager;
  protected groupId: GroupName = Groups.webServer;

  constructor(protected readonly queueService: MessageQueueService, protected readonly websocketService: MyWebsocketService, protected readonly deadLetterProducerService: DeadLetterProducerService) {
    super(queueService, deadLetterProducerService);
    this.websocketService.handleMessage = this.handleMessage.bind(this);
  }

  isMessageBrokerMessage(data: any) {
    const event: EventName = data.event;
    return event === Events.job;
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
