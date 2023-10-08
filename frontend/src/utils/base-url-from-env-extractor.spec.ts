/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BaseUrlFromEnvExtractor } from './base-url-from-env-extractor'

describe('BaseUrlFromEnvExtractor', () => {
  it('should return the base urls if all are valid urls', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_INTERNAL_API_URL = 'https://internal.example.org/'

    const sut = new BaseUrlFromEnvExtractor()

    expect(sut.extractBaseUrls()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      internalApiUrl: 'https://internal.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it('should throw if no var is set', () => {
    process.env.HD_BASE_URL = undefined
    process.env.HD_RENDERER_BASE_URL = undefined
    process.env.HD_INTERNAL_API_URL = undefined
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it("should throw if editor base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'bibedibabedibu'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_INTERNAL_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it("should throw if renderer base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'bibedibabedibu'
    process.env.HD_INTERNAL_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it("should throw if internal api url isn't an URL", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_INTERNAL_API_URL = 'bibedibabedibu'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it('should throw if editor base url contains a subdirectory', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/asd/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_INTERNAL_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it('should throw if renderer base url contains a subdirectory', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/asd/'
    process.env.HD_INTERNAL_API_URL = 'https://internal.example.org/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it('should throw if internal api url contains a subdirectory', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    process.env.HD_INTERNAL_API_URL = 'https://internal.example.org/asd/'
    const sut = new BaseUrlFromEnvExtractor()

    expect(() => sut.extractBaseUrls()).toThrow()
  })

  it('should copy editor base url to renderer base url if url is omitted', () => {
    process.env.HD_BASE_URL = 'https://editor1.example.org/'
    delete process.env.HD_RENDERER_BASE_URL
    delete process.env.HD_INTERNAL_API_URL
    const sut = new BaseUrlFromEnvExtractor()

    expect(sut.extractBaseUrls()).toStrictEqual({
      renderer: 'https://editor1.example.org/',
      internalApiUrl: undefined,
      editor: 'https://editor1.example.org/'
    })
  })
})
