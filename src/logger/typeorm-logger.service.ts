/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * The code in this class is based on:
 * https://github.com/typeorm/typeorm/blob/master/src/logger/AdvancedConsoleLogger.ts
 */
import { Injectable } from '@nestjs/common';
import { Logger, QueryRunner } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';

import { ConsoleLoggerService } from './console-logger.service';

@Injectable()
export class TypeormLoggerService implements Logger {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext('TypeORM');
    this.logger.setSkipColor(true);
  }

  log(level: 'log' | 'info' | 'warn', message: unknown, _?: QueryRunner): void {
    switch (level) {
      case 'log':
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
    }
  }

  logMigration(message: string, _?: QueryRunner): void {
    // eslint-disable-next-line local-rules/correct-logger-context
    this.logger.log(message, 'migration');
  }

  logQuery(query: string, parameters?: unknown[], _?: QueryRunner): void {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    // eslint-disable-next-line local-rules/correct-logger-context
    this.logger.debug(PlatformTools.highlightSql(sql), 'query');
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _?: QueryRunner,
  ): void {
    const sql =
      query +
      (parameters && parameters.length
        ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}`
        : '');
    this.logger.debug(PlatformTools.highlightSql(sql));
    // eslint-disable-next-line local-rules/correct-logger-context
    this.logger.debug(error.toString(), 'queryError');
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _?: QueryRunner,
  ): void {
    const sql =
      query +
      (parameters && parameters.length
        ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}`
        : '');
    /* eslint-disable local-rules/correct-logger-context */
    this.logger.warn(PlatformTools.highlightSql(sql), 'querySlow');
    this.logger.warn(`execution time: ${time}`, 'querySlow');
    /* eslint-enable local-rules/correct-logger-context */
  }

  logSchemaBuild(message: string, _?: QueryRunner): void {
    // eslint-disable-next-line local-rules/correct-logger-context
    this.logger.debug(message, 'schemaBuild');
  }

  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefore we are handle this case too.
   */
  protected stringifyParams(parameters: unknown[]): string {
    try {
      return JSON.stringify(parameters);
    } catch (error) {
      // most probably circular objects in parameters
      return parameters.toString();
    }
  }
}
