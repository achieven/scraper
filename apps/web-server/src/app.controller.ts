import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Url } from '../../../libs/shared/src/models/models.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck(): string {
    return 'ok';
  }

  @Post('job')
  async createJob(@Body() body: Url) {
    return this.appService.create(body);
  }
}
