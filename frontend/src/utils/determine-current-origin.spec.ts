/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { determineCurrentOrigin } from './determine-current-origin'
import * as IsClientSideRenderingModule from './is-client-side-rendering'
import type { NextPageContext } from 'next'
import { Mock } from 'ts-mockery'

jest.mock('./is-client-side-rendering')
describe('determineCurrentOrigin', () => {
  describe('client side', () => {
    it('parses a client side origin correctly', () => {
      jest.spyOn(IsClientSideRenderingModule, 'isClientSideRendering').mockImplementation(() => true)
      const expectedOrigin = 'expectedOrigin'
      Object.defineProperty(window, 'location', { value: { origin: expectedOrigin } })
      expect(determineCurrentOrigin(Mock.of<NextPageContext>({}))).toBe(expectedOrigin)
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      jest.spyOn(IsClientSideRenderingModule, 'isClientSideRendering').mockImplementation(() => false)
    })

    it("won't return an origin if no request is present", () => {
      expect(determineCurrentOrigin(Mock.of<NextPageContext>({}))).toBeUndefined()
    })

    it("won't return an origin if no headers are present", () => {
      expect(determineCurrentOrigin(Mock.of<NextPageContext>({ req: { headers: undefined } }))).toBeUndefined()
    })

    it("won't return an origin if no host is present", () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {}
            }
          })
        )
      ).toBeUndefined()
    })

    it('will return an origin for a forwarded host', () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                'x-forwarded-host': 'forwardedMockHost',
                'x-forwarded-proto': 'mockProtocol'
              }
            }
          })
        )
      ).toBe('mockProtocol://forwardedMockHost')
    })

    it("will fallback to host header if x-forwarded-host isn't present", () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                host: 'mockHost',
                'x-forwarded-proto': 'mockProtocol'
              }
            }
          })
        )
      ).toBe('mockProtocol://mockHost')
    })

    it('will prefer x-forwarded-host over host', () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                'x-forwarded-host': 'forwardedMockHost',
                host: 'mockHost',
                'x-forwarded-proto': 'mockProtocol'
              }
            }
          })
        )
      ).toBe('mockProtocol://forwardedMockHost')
    })

    it('will fallback to http if x-forwarded-proto is missing', () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                'x-forwarded-host': 'forwardedMockHost'
              }
            }
          })
        )
      ).toBe('http://forwardedMockHost')
    })

    it('will use the first header if x-forwarded-proto is defined multiple times', () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                'x-forwarded-proto': ['mockProtocol1', 'mockProtocol2'],
                'x-forwarded-host': 'forwardedMockHost'
              }
            }
          })
        )
      ).toBe('mockProtocol1://forwardedMockHost')
    })

    it('will use the first header if x-forwarded-host is defined multiple times', () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                'x-forwarded-host': ['forwardedMockHost1', 'forwardedMockHost2']
              }
            }
          })
        )
      ).toBe('http://forwardedMockHost1')
    })

    it('will use the first value if x-forwarded-proto is a comma separated list', () => {
      expect(
        determineCurrentOrigin(
          Mock.of<NextPageContext>({
            req: {
              headers: {
                'x-forwarded-proto': 'mockProtocol1,mockProtocol2',
                'x-forwarded-host': 'forwardedMockHost'
              }
            }
          })
        )
      ).toBe('mockProtocol1://forwardedMockHost')
    })
  })
})
