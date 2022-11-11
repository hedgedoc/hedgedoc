/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

type OutputFunction = (...data: unknown[]) => void

/**
 * Simple logger that prefixes messages with a timestamp and a name.
 */
export class Logger {
  private readonly scope: string

  constructor(scope: string) {
    this.scope = scope
  }

  /**
   * Logs a debug message.
   *
   * @param data data to log
   */
  debug(...data: unknown[]): void {
    this.log(LogLevel.DEBUG, ...data)
  }

  /**
   * Logs a normal informative message.
   *
   * @param data data to log
   */
  info(...data: unknown[]): void {
    this.log(LogLevel.INFO, ...data)
  }

  /**
   * Logs a warning.
   *
   * @param data data to log
   */
  warn(...data: unknown[]): void {
    this.log(LogLevel.WARN, ...data)
  }

  /**
   * Logs an error.
   *
   * @param data data to log
   */
  error(...data: unknown[]): void {
    this.log(LogLevel.ERROR, ...data)
  }

  private log(loglevel: LogLevel, ...data: unknown[]) {
    const preparedData = [...this.prefix(), ...data]
    const logOutput = Logger.getLogOutput(loglevel)
    logOutput(...preparedData)
  }

  private static getLogOutput(logLevel: LogLevel): OutputFunction {
    switch (logLevel) {
      case LogLevel.INFO:
        return console.info
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.ERROR:
        return console.error
      case LogLevel.WARN:
        return console.warn
    }
  }

  private prefix(): string[] {
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    return [`%c[${timestamp}] %c(${this.scope})`, 'color: yellow', 'color: orange']
  }
}
