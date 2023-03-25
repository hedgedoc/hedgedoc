/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiResponse } from './api-response'
import { Mock } from 'ts-mockery'

describe('ApiResponse', () => {
  it('getResponse returns input response', () => {
    const mockResponse = Mock.of<Response>()
    const responseObj = new ApiResponse(mockResponse)
    expect(responseObj.getResponse()).toEqual(mockResponse)
  })

  describe('asParsedJsonObject with', () => {
    it('invalid header', async () => {
      const mockHeaders = new Headers()
      mockHeaders.set('Content-Type', 'text/invalid')
      const mockResponse = Mock.of<Response>({
        headers: mockHeaders
      })
      const responseObj = new ApiResponse(mockResponse)
      await expect(responseObj.asParsedJsonObject()).rejects.toThrow('Response body does not seem to be JSON encoded')
    })

    it('valid header', async () => {
      const mockHeaders = new Headers()
      mockHeaders.set('Content-Type', 'application/json')
      const mockBody = {
        Hedgy: '🦔'
      }
      const mockResponse = Mock.of<Response>({
        headers: mockHeaders,
        json(): Promise<typeof mockBody> {
          return Promise.resolve(mockBody)
        }
      })
      const responseObj = new ApiResponse(mockResponse)
      await expect(responseObj.asParsedJsonObject()).resolves.toEqual(mockBody)
    })
  })
})
