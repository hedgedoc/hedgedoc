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

interface KnexData {
  method: 'first' | 'select';
  options: Map<string, string>;
  timeout: boolean;
  cancelOnTimeout: boolean;
  bindings: (number | string)[];
  sql: string;
  // oxlint-disable-next-line @typescript-eslint/naming-convention
  __knexQueryUid: string;
}

@Injectable()
export class KnexLoggerService {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext('Knex');
  }

  formatKnexMessage(data: KnexData): string {
    return `Query: ${data.sql} Bindings: ${JSON.stringify(data.bindings)}`;
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

  debug(data: KnexData): void {
    this.logger.debug(this.formatKnexMessage(data));
  }
}
