/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Settings } from 'luxon'
import { formatChangedAt } from './format-date'

describe('formatChangedAt', () => {
  beforeAll(() => {
    Settings.defaultLocale = 'en'
    jest.useFakeTimers().setSystemTime(new Date('2025-02-19T12:03:17+01:00'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('ISO String', () => {
    const result = formatChangedAt('2025-02-16T12:03:17+01:00')
    expect(result).toStrictEqual('3 days ago')
  })
})
