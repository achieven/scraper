import { Injectable, Inject } from '@nestjs/common';


import { MessageProducerService } from '../../../libs/shared/src/queue/message-producer.service';
import { DeadLetterProducerService } from '../../../libs/shared/src/queue/dead-letter-producer.service';
import { MessageQueueService } from '../../../libs/shared/src/queue/message-queue.service';

import { QueueMessageUrl, WebsocketData } from '../../../libs/shared/src/models/models.service';
import { Groups, TopicName, GroupName, Topics } from '../../../libs/shared/src/queue/queue.service';
import { Events } from '../../../libs/shared/src/websocket/websocket-server.service';
import { WebsocketServerService } from '../../../libs/shared/src/websocket/websocket-server.service';

@Injectable()
export class MyWebsocketService extends WebsocketServerService {
  constructor(@Inject('WEB_SOCKET_PORT') port: number, @Inject('MY_INTERNAL_IP') internalIp: string) {
    super(port, internalIp);
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

  isMessageBrokerMessage(data: WebsocketData) {
    return data.event === Events.job;
  }

  async handleMessage(websocketId: string, data: WebsocketData) {
    await this.websocketService.processMessage(data);
    if (this.isMessageBrokerMessage(data)) {
      const message: QueueMessageUrl = {
        url: data.message as string,
        clientWebsocketId: websocketId,
        internalIp: this.websocketService.internalIp
      }
      await this.sendMessage(this.outputTopic, JSON.stringify(message));
    }
  }
}
