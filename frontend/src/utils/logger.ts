/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isDevMode, isTestMode } from './test-modes'
import { DateTime } from 'luxon'
import pico from 'picocolors'

/**
 * Simple logger that prefixes messages with a timestamp and a name.
 */
export class Logger {
  private readonly scope: string
  private readonly debugLoggingEnabled: boolean

  constructor(scope: string) {
    this.scope = scope
    this.debugLoggingEnabled = isDevMode || isTestMode || this.isDebugLoggingEnabled()
  }

  private isDebugLoggingEnabled() {
    try {
      return !!window?.localStorage?.getItem('debugLogging')
    } catch {
      return false
    }
  }

  /**
   * Logs a debug message.
   *
   * @param data data to log
   */
  debug(...data: unknown[]): void {
    if (this.debugLoggingEnabled) {
      this.log(console.debug, ...data)
    }
  }

  /**
   * Logs a normal informative message.
   *
   * @param data data to log
   */
  info(...data: unknown[]): void {
    this.log(console.info, ...data)
  }

  /**
   * Logs a warning.
   *
   * @param data data to log
   */
  warn(...data: unknown[]): void {
    this.log(console.warn, ...data)
  }

  /**
   * Logs an error.
   *
   * @param data data to log
   */
  error(...data: unknown[]): void {
    this.log(console.error, ...data)
  }

  private log(logSink: (...data: unknown[]) => void, ...data: unknown[]) {
    logSink(...this.prefix(), ...data)
  }

  private prefix(): string[] {
    const timestamp = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')

    if (typeof window === 'undefined') {
      return [pico.yellow(`[${timestamp}]`), pico.green(`(${this.scope})`)]
    } else {
      return [`%c[${timestamp}] %c(${this.scope})`, 'color: yellow', 'color: green']
    }
  }
}
