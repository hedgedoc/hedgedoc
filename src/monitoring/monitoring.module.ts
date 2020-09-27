import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { MonitoringService } from './monitoring.service';

@Module({
  providers: [MonitoringService],
  exports: [MonitoringService],
  imports: [LoggerModule],
})
export class MonitoringModule {}
