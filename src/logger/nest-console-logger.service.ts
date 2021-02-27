/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, LoggerService } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';

Injectable();

export class NestConsoleLoggerService implements LoggerService {
  private consoleLoggerService = new ConsoleLoggerService();

  debug(message: unknown, context?: string): void {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.debug(message);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.error(message, trace);
  }

  log(message: unknown, context?: string): void {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.log(message);
  }

  verbose(message: unknown, context?: string): void {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.verbose(message);
  }

  warn(message: unknown, context?: string): void {
    this.consoleLoggerService.setContext(context);
    this.consoleLoggerService.warn(message);
  }
}
