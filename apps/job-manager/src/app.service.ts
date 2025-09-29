import { Injectable } from '@nestjs/common';
import { isURL } from 'class-validator';


import { ConsumerProducerService } from '../../../libs/shared/src/queue/consumer-producer.service';

import { Topics, Groups, TopicName, GroupName } from '../../../libs/shared/src/queue/queue.service';
import { QueueMessageUrl } from '../../../libs/shared/src/queue/queue.service';


@Injectable()
export class AppService extends ConsumerProducerService {
  protected inputTopic: TopicName = Topics.jobReceived;
  protected outputTopic: TopicName = Topics.jobValidated;
  protected groupId: GroupName = Groups.jobManager;

  async onModuleInit() {
    await this.init();
  }

  protected async consumeMessage(messageData: QueueMessageUrl): Promise<void> {
    const isValid = this.validateMessage(messageData);
    if (!isValid) {
      throw new Error(`invalid message ${JSON.stringify(messageData)}`);
    }
  }

  private validateMessage(messageData: QueueMessageUrl): boolean {
    const hasUrl = messageData.url;
    return hasUrl && isURL(messageData.url);
  }
}
