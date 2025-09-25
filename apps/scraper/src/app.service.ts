import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { ConsumerProducerService } from '../../../libs/shared/src/queue/consumer-producer.service';
import { Topics, Groups } from '../../../libs/shared/src/queue/queue.service';
import { Url } from '../../../libs/shared/src/models/models.service';

@Injectable()
export class AppService extends ConsumerProducerService {
  protected inputTopic: string = Topics.scraper;
  protected outputTopic: string = Topics.final;
  protected groupId: string = Groups.scraper;

  async onModuleInit() {
    await this.init();
  }

  protected async consumeMessage(messageData: Url): Promise<string> {
    return await this.scrape(messageData);
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
