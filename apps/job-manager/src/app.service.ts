import { Injectable } from '@nestjs/common';
import { isURL } from 'class-validator';
import { ConsumerProducerService } from '../../../libs/shared/src/queue/consumer-producer.service';
import { Topics, Groups } from '../../../libs/shared/src/queue/queue.service';
import { Url } from '../../../libs/shared/src/models/models.service';

@Injectable()
export class AppService extends ConsumerProducerService {
  protected inputTopic: string = Topics.jobManager;
  protected outputTopic: string = Topics.scraper;
  protected groupId: string = Groups.jobManager;

  async onModuleInit() {
    await this.init();
  }

  protected async consumeMessage(messageData: Url): Promise<void> {
    const isValid = this.validateMessage(messageData);
    if (!isValid) {
      throw new Error(`invalid message ${JSON.stringify(messageData)}`);
    }
    return Promise.resolve();
  }

  private validateMessage(messageData: Url): boolean {
    const hasUrl = messageData.url;
    return hasUrl && isURL(messageData.url);
  }
}
