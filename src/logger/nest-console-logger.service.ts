import { Injectable, LoggerService } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';

Injectable();

export class NestConsoleLoggerService implements LoggerService {
  private consoleLoggerService = new ConsoleLoggerService();

  debug(message: any, context?: string): any {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.debug(message);
  }

  error(message: any, trace?: string, context?: string): any {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.error(message, trace);
  }

  log(message: any, context?: string): any {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.log(message);
  }

  verbose(message: any, context?: string): any {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.verbose(message);
  }

  warn(message: any, context?: string): any {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.warn(message);
  }
}
