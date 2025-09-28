import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';


import { ConsumerService } from '../../../libs/shared/src/queue/consumer.service';
import { TerminatorWebsocketService } from '../../../libs/shared/src/websocket/terminator-websocket.service';
import { DeadLetterProducerService } from '../../../libs/shared/src/queue/dead-letter-producer.service';
import { MessageQueueService } from '../../../libs/shared/src/queue/message-queue.service';

import {  TopicName, GroupName, Groups, Topics } from '../../../libs/shared/src/queue/queue.service';
import { Url } from '../../../libs/shared/src/models/models.service';

@Injectable()
export class MyWebsocketService extends TerminatorWebsocketService {
  constructor(@Inject('TERMINATOR_PORT') port: number) {
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

  protected async consumeMessage(messageData: Url): Promise<string> {
    const response = await this.scrape(messageData);
    const message = {
      websocketId: messageData.clientWebsocketId,
      message: response
    }
    await this.websocketService.notify(messageData.initiatorWebsocketId, message);
    return response;

  }

  private async scrape(messageData: Url): Promise<string> {
    try {
      const response = await axios.get(messageData.url);
      return response.data;
    } catch (err) {
      throw new Error(`Error scraping ${messageData.url}, err: ${err}`);
    }
  }
}
