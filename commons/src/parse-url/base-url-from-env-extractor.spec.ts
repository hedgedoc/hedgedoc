/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BaseUrlFromEnvExtractor } from './base-url-from-env-extractor.js'
import { describe, it, expect } from '@jest/globals'
import { NoSubdirectoryAllowedError, NoValidUrlError } from './errors.js'
import { BaseUrls } from './base-urls.types.js'

describe('BaseUrlFromEnvExtractor', () => {
  it('should return the correctly parsed values if all are set', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_SSR_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()
    const result = sut.extractBaseUrls()

    expect(result).toStrictEqual({
      editor: 'https://editor.example.org/',
      renderer: 'https://renderer.example.org/',
      ssrApi: 'https://internal.example.org/'
    } as BaseUrls)
  })

  it('should throw an error if no base url is set', () => {
    process.env.HD_BASE_URL = undefined
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoValidUrlError)
  })

  it("should throw an error if editor base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'bibedibabedibu'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_SSR_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoValidUrlError)
  })

  it('should throw an error if renderer base url is set but no valid URL', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'bibedibabedibu'
    process.env.HD_SSR_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoValidUrlError)
  })

  it('should throw an error if ssr api base url is set but no valid URL', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_SSR_API_URL = 'bibedibabedibu'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoValidUrlError)
  })

  it('should throw an error if editor base url contains a path', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/subpath/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoSubdirectoryAllowedError)
  })

  it('should throw an error if renderer base url contains a path', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/subpath/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoSubdirectoryAllowedError)
  })

  it('should throw an error if ssr api url contains a path', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_SSR_API_URL = 'https://internal.example.org/subpath/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow(NoSubdirectoryAllowedError)
  })

  it('should copy editor base url to renderer base url if renderer base url is omitted', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    delete process.env.HD_RENDERER_BASE_URL
    process.env.HD_SSR_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()
    const result = sut.extractBaseUrls()

    expect(result).toStrictEqual({
      editor: 'https://editor.example.org/',
      renderer: 'https://editor.example.org/',
      ssrApi: 'https://internal.example.org/'
    } as BaseUrls)
  })

  it('should copy editor base url to ssr api url if ssr api url is omitted', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    delete process.env.HD_SSR_API_URL
    const sut = new BaseUrlFromEnvExtractor()
    const result = sut.extractBaseUrls()

    expect(result).toStrictEqual({
      editor: 'https://editor.example.org/',
      renderer: 'https://renderer.example.org/',
      ssrApi: 'https://editor.example.org/'
    } as BaseUrls)
  })
})
