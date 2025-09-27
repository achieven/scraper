import { Injectable } from '@nestjs/common';
import { Consumer, ConsumerConfig, KafkaMessage } from 'kafkajs';

import { QueueService } from './queue.service';
import { Url } from '../models/models.service';
import { DeadLetterProducerService } from './dead-letter-producer.service';


@Injectable()
export abstract class ConsumerService {
    protected abstract inputTopic: string;
    protected abstract groupId: string;
    protected consumerConfig?: ConsumerConfig;
    protected consumer?: Consumer;

    constructor(protected readonly queueService: QueueService, protected readonly deadLetterProducerService: DeadLetterProducerService) {}

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
        console.log('Consumer connected');
        await this.consumer.subscribe({ topic: this.inputTopic, fromBeginning: true })
        let counter = 0;
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
              try {
                counter++;
                console.log(counter)
                await this.handleMessageIfValued(this.getMessageValue(message))
                counter = 0
              } catch (err) {
                if (counter - 2 === this.consumerConfig?.retry?.retries) {
                  counter = 0
                  this.handleRetryExhausted(this.getMessageValue(message), topic, partition, message, err)
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

    protected async handleMessage(messageValue: string): Promise<any> {
      return await this.consumeMessage(JSON.parse(messageValue));   
    }

    private async handleMessageIfValued(messageValue: string | undefined) {
      if (messageValue) {
        await this.handleMessage(messageValue)
        return
      } else {
        throw new Error('Message value is undefined');
      }
    }

    private async handleRetryExhausted(messageValue: string | undefined, topic: string, partition: number, message: KafkaMessage, err: any) {
        if (messageValue) {
            await this.deadLetterProducerService.sendDeadLetter(topic, partition, message, err);
            return
        } else {
            throw new Error('Message value is undefined');
        }
    }

    protected abstract consumeMessage(messageData: Url): Promise<any>;
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
