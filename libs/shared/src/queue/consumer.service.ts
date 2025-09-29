import { Injectable } from '@nestjs/common';
import { Consumer, ConsumerConfig, KafkaMessage } from 'kafkajs';


import { DeadLetterProducerService } from './dead-letter-producer.service';
import { MessageQueueService } from './message-queue.service';

import { QueueMessageUrl } from '../models/models.service';


export const ErrorMessages = {  
  messageValueUndefined: 'Message value is undefined',
  messageWithResponse: 'Message with response',
} as const

@Injectable()
export abstract class ConsumerService {
    protected abstract inputTopic: string;
    protected abstract groupId: string;
    protected consumerConfig?: ConsumerConfig;
    protected consumer?: Consumer;

    constructor(protected readonly queueService: MessageQueueService, protected readonly deadLetterProducerService: DeadLetterProducerService) {}

    async init() {
        this.consumerConfig = {
            groupId: this.groupId,
            retry: {
              retries: 3,
            }
        }
        this.consumer = this.queueService.myKafka.consumer(this.consumerConfig);
        await this.consumer.connect();
        console.log('Consumer connected');
        await this.consumer.subscribe({ topic: this.inputTopic, fromBeginning: true })
        let counter = 0;
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
              try {
                counter++;
                await this.handleMessageIfValued(this.getMessageValue(message))
                counter = 0
              } catch (err: any) {
                
                const exhastedRestries = counter - 1 === this.consumerConfig?.retry?.retries
                let messageResult;
                if (exhastedRestries) {
                  counter = 0
                  if (err.message.startsWith(ErrorMessages.messageWithResponse)) {
                    const error = JSON.parse(err.message.substring(ErrorMessages.messageWithResponse.length))
                    messageResult = error.response
                    err = new Error(error.stack)
                  }
                  await this.handleRetryExhausted(this.getMessageValue(message), topic, partition, message, err, messageResult)
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
        return await this.handleMessage(messageValue)
      } else {
        throw new Error(ErrorMessages.messageValueUndefined);
      }
    }

    private async handleRetryExhausted(messageValue: string | undefined, topic: string, partition: number, message: KafkaMessage, err: any, messageResult: any) {
        if (messageValue) {
            await this.deadLetterProducerService.sendDeadLetter(topic, partition, message, err, messageResult);
            return
        } else {
            throw new Error(ErrorMessages.messageValueUndefined);
        }
    }

    protected abstract consumeMessage(messageData: QueueMessageUrl): Promise<any>;
}
