/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { measurePerformance } from './measure-performance'
import { Mock } from 'ts-mockery'

describe('measure performance', () => {
  it('uses the global performance functions', () => {
    const measurementName = 'marker-name'
    const markMock = jest.fn()
    const measureMock = jest.fn()
    const startMaker = `${measurementName} - start`
    const endMarker = `${measurementName} - end`

    Object.defineProperty(window, 'performance', {
      get: () =>
        Mock.of<Performance>({
          mark: markMock,
          measure: measureMock
        })
    })
    const result = measurePerformance(measurementName, () => {
      return 'value'
    })
    expect(result).toBe('value')
    expect(markMock).toHaveBeenNthCalledWith(1, startMaker)
    expect(markMock).toHaveBeenNthCalledWith(2, endMarker)
    expect(measureMock).toBeCalledWith(measurementName, startMaker, endMarker)
  })

  it('runs the task without global performance functions', () => {
    Object.defineProperty(window, 'performance', {
      get: () => undefined
    })
    const result = measurePerformance('measurementName', () => {
      return 'value'
    })
    expect(result).toBe('value')
  })
})
