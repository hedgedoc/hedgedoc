/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Inject,
  Injectable,
  LoggerService,
  Optional,
  Scope,
} from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';

import appConfiguration, { AppConfig } from '../config/app.config';
import { Loglevel } from '../config/loglevel.enum';
import { needToLog } from '../config/utils';

import clc = require('cli-color');
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

@Injectable({ scope: Scope.TRANSIENT })
export class ConsoleLoggerService implements LoggerService {
  private classContext: string | undefined;
  private lastTimestamp: number;
  private skipColor = false;

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

  setSkipColor(skipColor: boolean): void {
    this.skipColor = skipColor;
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

  static sanitize(input: string): string {
    return (
      input
        // remove ASCII control characters
        .replace(/\p{C}/gu, '')
        // replace all non-zeros width spaces with one space
        .replace(/\p{Zs}/gu, ' ')
    );
  }

  private printMessage(
    message: unknown,
    color: (message: string) => string,
    context = '',
    isTimeDiffEnabled?: boolean,
  ): void {
    let output;

    // if skipColor is set, we do not use colors and skip sanitizing
    if (this.skipColor) {
      if (isObject(message)) {
        output = `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n`;
      } else {
        output = message as string;
      }
    } else {
      if (isObject(message)) {
        output = `${color('Object:')}\n${ConsoleLoggerService.sanitize(
          JSON.stringify(message, null, 2),
        )}\n`;
      } else {
        output = color(ConsoleLoggerService.sanitize(message as string));
      }
    }

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
