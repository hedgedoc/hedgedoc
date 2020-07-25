import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';

@Module({
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
