import { Module } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';
import { NestConsoleLoggerService } from './nest-console-logger.service';

@Module({
  providers: [ConsoleLoggerService, NestConsoleLoggerService],
  exports: [ConsoleLoggerService, NestConsoleLoggerService],
})
export class LoggerModule {}
