import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { HistoryService } from './history.service';

@Module({
  providers: [HistoryService],
  exports: [HistoryService],
  imports: [LoggerModule],
})
export class HistoryModule {}
