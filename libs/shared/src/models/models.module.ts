import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';

@Module({
  exports: [ModelsService],
  providers: [ModelsService]
})
export class ModelsModule {}
