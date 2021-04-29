/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable, Optional, Scope } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import clc = require('cli-color');
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import appConfiguration, { AppConfig } from '../config/app.config';
import { Loglevel } from '../config/loglevel.enum';
import { needToLog } from '../config/utils';

@Injectable({ scope: Scope.TRANSIENT })
export class ConsoleLoggerService {
  private classContext: string | undefined;
  private lastTimestamp: number;

  constructor(
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
    @Optional() context?: string,
  ) {
    this.classContext = context;
  }

  setContext(context: string): void {
    this.classContext = context;
  }

  error(message: unknown, trace = '', functionContext?: string): void {
    this.printMessage(
      message,
      clc.red,
      this.makeContextString(functionContext),
      false,
    );
    ConsoleLoggerService.printStackTrace(trace);
  }

  log(message: unknown, functionContext?: string): void {
    if (needToLog(this.appConfig.loglevel, Loglevel.INFO)) {
      this.printMessage(
        message,
        clc.green,
        this.makeContextString(functionContext),
        false,
      );
    }
  }

  warn(message: unknown, functionContext?: string): void {
    if (needToLog(this.appConfig.loglevel, Loglevel.WARN)) {
      this.printMessage(
        message,
        clc.yellow,
        this.makeContextString(functionContext),
        false,
      );
    }
  }

  debug(message: unknown, functionContext?: string): void {
    if (needToLog(this.appConfig.loglevel, Loglevel.DEBUG)) {
      this.printMessage(
        message,
        clc.magentaBright,
        this.makeContextString(functionContext),
        false,
      );
    }
  }

  verbose(message: unknown, functionContext?: string): void {
    if (needToLog(this.appConfig.loglevel, Loglevel.TRACE)) {
      this.printMessage(
        message,
        clc.cyanBright,
        this.makeContextString(functionContext),
        false,
      );
    }
  }

  private makeContextString(functionContext?: string): string {
    let context = this.classContext;
    if (!context) {
      context = 'HedgeDoc';
    }
    if (functionContext) {
      context += '.' + functionContext + '()';
    }
    return context;
  }

  private printMessage(
    message: unknown,
    color: (message: string) => string,
    context = '',
    isTimeDiffEnabled?: boolean,
  ): void {
    const output = isObject(message)
      ? `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n`
      : color(message as string);

    const localeStringOptions: DateTimeFormatOptions = {
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: '2-digit',
      month: '2-digit',
    };
    //TODO make timestamp optional
    const timestamp = new Date(Date.now()).toLocaleString(
      undefined,
      localeStringOptions,
    );

    const contextMessage = context ? clc.blue(`[${context}] `) : '';
    const timestampDiff = this.updateAndGetTimestampDiff(isTimeDiffEnabled);

    process.stdout.write(
      `${timestamp} ${contextMessage}${output}${timestampDiff}\n`,
    );
  }

  private updateAndGetTimestampDiff(isTimeDiffEnabled?: boolean): string {
    const includeTimestamp = this.lastTimestamp && isTimeDiffEnabled;
    const result = includeTimestamp
      ? clc.yellow(` +${Date.now() - this.lastTimestamp}ms`)
      : '';
    this.lastTimestamp = Date.now();
    return result;
  }

  private static printStackTrace(trace: string): void {
    if (!trace) {
      return;
    }
    process.stdout.write(`${trace}\n`);
  }
}
