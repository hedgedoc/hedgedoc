/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from './logger'
import { Settings } from 'luxon'
import { Mock } from 'ts-mockery'

let testMode = false
let devMode = false
jest.mock('./test-modes', () => ({
  get isTestMode() {
    return testMode
  },
  get isDevMode() {
    return devMode
  }
}))

describe('Logger', () => {
  let originalNow: () => number
  let dateShift = 0

  let infoLogMock: jest.SpyInstance
  let warnLogMock: jest.SpyInstance
  let errorLogMock: jest.SpyInstance
  let debugLogMock: jest.SpyInstance
  let defaultLogMock: jest.SpyInstance
  let isLocalStorageAccessDenied = false

  const mockLocalStorage = () => {
    const storage = new Map<string, string>()
    const localStorageMock = Mock.of<Storage>({
      getItem: (key) => {
        if (isLocalStorageAccessDenied) {
          throw new Error('Access Denied!')
        } else {
          return storage.get(key) ?? null
        }
      },
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key)
    })
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
  }

  beforeEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()

    testMode = false
    devMode = false
    isLocalStorageAccessDenied = false
    mockLocalStorage()

    infoLogMock = jest.spyOn(console, 'info').mockReturnValue()
    warnLogMock = jest.spyOn(console, 'warn').mockReturnValue()
    errorLogMock = jest.spyOn(console, 'error').mockReturnValue()
    debugLogMock = jest.spyOn(console, 'debug').mockReturnValue()
    defaultLogMock = jest.spyOn(console, 'log').mockReturnValue()

    originalNow = Settings.now
    Settings.now = () => new Date(2021, 9, 25, dateShift, 1 + dateShift, 2 + dateShift, 3 + dateShift).valueOf()
  })

  afterEach(() => {
    Settings.now = originalNow
  })

  describe('debug logging', () => {
    it('wont log without test mode, dev mode and local storage', () => {
      dateShift = 0

      new Logger('prefix').debug('beans')

      expect(infoLogMock).not.toBeCalled()
      expect(warnLogMock).not.toBeCalled()
      expect(errorLogMock).not.toBeCalled()
      expect(debugLogMock).not.toBeCalled()
      expect(defaultLogMock).not.toBeCalled()
    })

    it('will enable debug logging in production mode but with local storage setting', () => {
      dateShift = 1

      window.localStorage.setItem('debugLogging', 'ACTIVATED!')

      new Logger('prefix').debug('muffin')

      expect(infoLogMock).not.toBeCalled()
      expect(warnLogMock).not.toBeCalled()
      expect(errorLogMock).not.toBeCalled()
      expect(debugLogMock).toHaveBeenCalledWith(
        '%c[2021-10-25 01:02:03] %c(prefix)',
        'color: yellow',
        'color: green',
        'muffin'
      )
      expect(defaultLogMock).not.toBeCalled()
    })

    it('wont log in production mode but without local storage access', () => {
      dateShift = 0

      isLocalStorageAccessDenied = true

      new Logger('prefix').debug('beans')

      expect(infoLogMock).not.toBeCalled()
      expect(warnLogMock).not.toBeCalled()
      expect(errorLogMock).not.toBeCalled()
      expect(debugLogMock).not.toBeCalled()
      expect(defaultLogMock).not.toBeCalled()
    })

    it('will enable debug logging enabled in test mode', () => {
      dateShift = 3

      testMode = true

      new Logger('prefix').debug('muffin')

      expect(infoLogMock).not.toBeCalled()
      expect(warnLogMock).not.toBeCalled()
      expect(errorLogMock).not.toBeCalled()
      expect(debugLogMock).toHaveBeenCalledWith(
        '%c[2021-10-25 03:04:05] %c(prefix)',
        'color: yellow',
        'color: green',
        'muffin'
      )
      expect(defaultLogMock).not.toBeCalled()
    })

    it('will enable debug logging enabled in dev mode', () => {
      dateShift = 4

      devMode = true

      new Logger('prefix').debug('muffin')

      expect(infoLogMock).not.toBeCalled()
      expect(warnLogMock).not.toBeCalled()
      expect(errorLogMock).not.toBeCalled()
      expect(debugLogMock).toHaveBeenCalledWith(
        '%c[2021-10-25 04:05:06] %c(prefix)',
        'color: yellow',
        'color: green',
        'muffin'
      )
      expect(defaultLogMock).not.toBeCalled()
    })
  })

  it('logs a info message into the console', () => {
    dateShift = 5

    new Logger('prefix').info('toast')

    expect(infoLogMock).toHaveBeenCalledWith(
      '%c[2021-10-25 05:06:07] %c(prefix)',
      'color: yellow',
      'color: green',
      'toast'
    )
    expect(warnLogMock).not.toBeCalled()
    expect(errorLogMock).not.toBeCalled()
    expect(debugLogMock).not.toBeCalled()
    expect(defaultLogMock).not.toBeCalled()
    new Logger('prefix').info('toast')
  })

  it('logs a warn message into the console', () => {
    dateShift = 6

    new Logger('prefix').warn('eggs')

    expect(infoLogMock).not.toBeCalled()
    expect(warnLogMock).toHaveBeenCalledWith(
      '%c[2021-10-25 06:07:08] %c(prefix)',
      'color: yellow',
      'color: green',
      'eggs'
    )
    expect(errorLogMock).not.toBeCalled()
    expect(debugLogMock).not.toBeCalled()
    expect(defaultLogMock).not.toBeCalled()
  })

  it('logs a error message into the console', () => {
    dateShift = 7

    new Logger('prefix').error('bacon')

    expect(infoLogMock).not.toBeCalled()
    expect(warnLogMock).not.toBeCalled()
    expect(errorLogMock).toHaveBeenCalledWith(
      '%c[2021-10-25 07:08:09] %c(prefix)',
      'color: yellow',
      'color: green',
      'bacon'
    )
    expect(debugLogMock).not.toBeCalled()
    expect(defaultLogMock).not.toBeCalled()
  })
})
