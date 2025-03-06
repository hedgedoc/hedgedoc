/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * The code in this class is based on:
 * https://github.com/typeorm/typeorm/blob/master/src/logger/AdvancedConsoleLogger.ts
 */
import { Injectable } from '@nestjs/common';

import { ConsoleLoggerService } from './console-logger.service';

@Injectable()
export class KnexLoggerService {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext('Knex');
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  deprecate(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
}
