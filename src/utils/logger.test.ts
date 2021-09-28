/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Logger, LogLevel } from './logger'
import { Settings } from 'luxon'

describe('Logger', () => {
  let consoleMock: jest.SpyInstance
  let originalNow: () => number
  let dateShift = 0

  function mockConsole(methodToMock: LogLevel, onResult: (result: string) => void) {
    consoleMock = jest.spyOn(console, methodToMock).mockImplementation((...data: string[]) => {
      const result = data.reduce((state, current) => state + ' ' + current)
      onResult(result)
    })
  }

  beforeEach(() => {
    originalNow = Settings.now
    Settings.now = () => new Date(2021, 9, 25, dateShift, 1 + dateShift, 2 + dateShift, 3 + dateShift).valueOf()
  })

  afterEach(() => {
    Settings.now = originalNow
    consoleMock.mockReset()
  })

  it('logs a debug message into the console', (done) => {
    dateShift = 0
    mockConsole(LogLevel.DEBUG, (result) => {
      expect(consoleMock).toBeCalled()
      expect(result).toEqual('%c[2021-10-25 00:01:02] %c(prefix) color: yellow color: orange beans')
      done()
    })
    new Logger('prefix').debug('beans')
  })

  it('logs a info message into the console', (done) => {
    dateShift = 1
    mockConsole(LogLevel.INFO, (result) => {
      expect(consoleMock).toBeCalled()
      expect(result).toEqual('%c[2021-10-25 01:02:03] %c(prefix) color: yellow color: orange toast')
      done()
    })
    new Logger('prefix').info('toast')
  })

  it('logs a warn message into the console', (done) => {
    dateShift = 2
    mockConsole(LogLevel.WARN, (result) => {
      expect(consoleMock).toBeCalled()
      expect(result).toEqual('%c[2021-10-25 02:03:04] %c(prefix) color: yellow color: orange eggs')
      done()
    })
    new Logger('prefix').warn('eggs')
  })

  it('logs a error message into the console', (done) => {
    dateShift = 3
    mockConsole(LogLevel.ERROR, (result) => {
      expect(consoleMock).toBeCalled()
      expect(result).toEqual('%c[2021-10-25 03:04:05] %c(prefix) color: yellow color: orange bacon')
      done()
    })
    new Logger('prefix').error('bacon')
  })
})
