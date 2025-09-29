import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';


import { ConsumerService, ErrorMessages } from '../../../libs/shared/src/queue/consumer.service';
import { WebsocketClientService } from '../../../libs/shared/src/websocket/websocket-client.service';
import { DeadLetterProducerService } from '../../../libs/shared/src/queue/dead-letter-producer.service';
import { MessageQueueService } from '../../../libs/shared/src/queue/message-queue.service';

import {  TopicName, GroupName, Groups, Topics } from '../../../libs/shared/src/queue/queue.service';
import { QueueMessageUrl } from '../../../libs/shared/src/models/models.service';
import { Events } from '../../../libs/shared/src/websocket/websocket-server.service';

@Injectable()
export class MyWebsocketService extends WebsocketClientService {
  constructor(@Inject('WEB_SOCKET_PORT') port: number) {
    super(port);
  }
}

@Injectable()
export class AppService extends ConsumerService {
  protected inputTopic: TopicName = Topics.scraper;
  protected groupId: GroupName = Groups.scraper;

  constructor(protected readonly queueService: MessageQueueService, protected readonly websocketService: MyWebsocketService, protected readonly deadLetterProducerService: DeadLetterProducerService) {
    super(queueService, deadLetterProducerService);
  }

  async onModuleInit() {
    await this.init();
  }

  protected async consumeMessage(messageData: QueueMessageUrl): Promise<string> {
    const response = await this.scrape(messageData);
    try {
      await this.sendHtmlToWebServer(messageData.internalIp, messageData.clientWebsocketId, response);
    } catch (err) {
      throw new Error(ErrorMessages.messageWithResponse + JSON.stringify({stack: err.stack, response}));
    }
    
    return response;

  }

  private async scrape(messageData: QueueMessageUrl): Promise<string> {
      const response = await axios.get(messageData.url);
      return response.data;
  }

  private async sendHtmlToWebServer(internalIp: string, clientWebsocketId: string, response: string): Promise<void> {
    return await this.websocketService.sendMessage(internalIp, {
      event: Events.alert,
      message: {
        clientWebsocketId,
        response
      }
    })
  }
}
