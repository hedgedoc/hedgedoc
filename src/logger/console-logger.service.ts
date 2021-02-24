/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, Optional, Scope } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import clc = require('cli-color');
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

@Injectable({ scope: Scope.TRANSIENT })
export class ConsoleLoggerService {
  private classContext: string;
  private lastTimestamp: number;

  constructor(@Optional() context?: string) {
    this.classContext = context;
  }

  setContext(context: string) {
    this.classContext = context;
  }

  error(message: unknown, trace = '', functionContext?: string) {
    this.printMessage(
      message,
      clc.red,
      this.makeContextString(functionContext),
      false,
    );
    this.printStackTrace(trace);
  }

  log(message: unknown, functionContext?: string) {
    this.printMessage(
      message,
      clc.green,
      this.makeContextString(functionContext),
      false,
    );
  }

  warn(message: unknown, functionContext?: string) {
    this.printMessage(
      message,
      clc.yellow,
      this.makeContextString(functionContext),
      false,
    );
  }

  debug(message: unknown, functionContext?: string) {
    this.printMessage(
      message,
      clc.magentaBright,
      this.makeContextString(functionContext),
      false,
    );
  }

  verbose(message: unknown, functionContext?: string) {
    this.printMessage(
      message,
      clc.cyanBright,
      this.makeContextString(functionContext),
      false,
    );
  }

  private makeContextString(functionContext: string) {
    let context = this.classContext;
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
  ) {
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

  private printStackTrace(trace: string) {
    if (!trace) {
      return;
    }
    process.stdout.write(`${trace}\n`);
  }
}
