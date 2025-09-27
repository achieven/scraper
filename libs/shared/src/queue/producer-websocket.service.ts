// import { Injectable } from '@nestjs/common';

// import { ProducerService } from './producer.service';
// import { ConcreteWebsocketService } from '../websocket/websocket.service';
// import { QueueService } from './queue.service';
// import { Html } from '../models/models.service';


// @Injectable()
// export abstract class ProducerWebsocketService extends ProducerService {
//     constructor(protected readonly queueService: QueueService, protected readonly websocketService: ConcreteWebsocketService) {
//         super(queueService);
//         this.websocketService.handleMessage = this.handleMessage.bind(this);
//     }

//     async consumeMessage(messageData: Html) {
//         await this.websocketService.notify(messageData.websocket, messageData);
//     }

//     async handleMessage(websocketId: string, data: any) {
//         await this.sendMessage(this.outputTopic, JSON.stringify({...data, websocket: websocketId}));
//     }
// }
