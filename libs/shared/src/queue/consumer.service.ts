import { Injectable } from '@nestjs/common';
import { Consumer, ConsumerConfig, KafkaMessage } from 'kafkajs';

import { QueueService } from './queue.service';
import { Url } from '../models/models.service';

@Injectable()
export abstract class ConsumerService {
    protected abstract inputTopic: string;
    protected abstract groupId: string;
    protected consumerConfig?: ConsumerConfig;
    protected consumer?: Consumer;

    constructor(protected readonly queueService: QueueService) {}

    async init() {
        this.consumerConfig = {
            groupId: this.groupId,
            retry: {
              retries: 3,
              restartOnFailure: async(err) => {
                console.log(err)
                return Promise.resolve(true)
              }
            }
        }
        this.consumer = this.queueService.getKafka().consumer(this.consumerConfig);
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.inputTopic, fromBeginning: true })
        let counter = 0;
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
              try {
                counter++;
                console.log(counter)
                await this.handleMessage(this.getMessageValue(message))
                counter = 0
              } catch (err) {
                if (counter - 2 === this.consumerConfig?.retry?.retries) {
                  counter = 0
                  this.handleRetryExhausted(this.getMessageValue(message), topic, partition, message)
                } else {
                    throw err;
                }
              }
            }
        })
    }

    getMessageValue(message: KafkaMessage): string | undefined {
      return message?.value?.toString();
    }

    async eachMessage(messageValue: string): Promise<void> {
      const response = await this.consumeMessage(JSON.parse(messageValue));
      const newValue = {response, ...JSON.parse(messageValue)}
      await this.produceMessage(JSON.stringify(newValue));
    }

    private async handleMessage(messageValue: string | undefined) {
      if (messageValue) {
        await this.eachMessage(messageValue)
        return
      } else {
        throw new Error('Message value is undefined');
      }
    }

    private async handleRetryExhausted(messageValue: string | undefined, topic: string, partition: number, message: KafkaMessage) {
        if (messageValue) {
            await this.produceDeadLetter(topic, partition, message);
            return
        } else {
            throw new Error('Message value is undefined');
        }
    }

    protected abstract consumeMessage(messageData: Url): Promise<any>;
    protected abstract produceMessage(messageValue: any): Promise<void>;
    protected abstract produceDeadLetter(topic: string, partition: number | null, message: KafkaMessage): Promise<void>;
}

@Injectable()
export class ConcreteConsumerService extends ConsumerService {
    protected inputTopic: string = '';
    protected groupId: string = '';

    async onInit(groupId: string, inputTopic: string) {
      this.groupId = groupId;
      this.inputTopic = inputTopic;
      await super.init();
      
    }

    protected consumeMessage(messageData: Url): Promise<void> {
      return Promise.resolve();
    };
    protected produceMessage(messageValue: any): Promise<void> {
      return Promise.resolve();
    };
    protected produceDeadLetter(topic: string, partition: number | null, message: KafkaMessage): Promise<void> {
      return Promise.resolve();
    };
}
