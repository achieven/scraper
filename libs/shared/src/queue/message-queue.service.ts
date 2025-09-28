import { Injectable } from "@nestjs/common";
import { QueueService } from "./queue.service";

@Injectable()
export class MessageQueueService extends QueueService {
    constructor() {
        super(process.env.KAFKA_HOST, process.env.KAFKA_PORT);
    }
}