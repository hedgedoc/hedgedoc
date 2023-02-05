/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BaseUrlFromEnvExtractor } from './base-url-from-env-extractor'

describe('BaseUrlFromEnvExtractor', () => {
  it('should return the base urls if both are valid urls', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    const result = baseUrlFromEnvExtractor.extractBaseUrls()
    expect(result.isPresent()).toBeTruthy()
    expect(result.get()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it('should return an empty optional if no var is set', () => {
    process.env.HD_BASE_URL = undefined
    process.env.HD_RENDERER_BASE_URL = undefined
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    expect(baseUrlFromEnvExtractor.extractBaseUrls().isEmpty()).toBeTruthy()
  })

  it("should return an empty optional if editor base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'bibedibabedibu'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    expect(baseUrlFromEnvExtractor.extractBaseUrls().isEmpty()).toBeTruthy()
  })

  it("should return an empty optional if renderer base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'bibedibabedibu'
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    expect(baseUrlFromEnvExtractor.extractBaseUrls().isEmpty()).toBeTruthy()
  })

  it("should return an optional if editor base url isn't ending with a slash", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    const result = baseUrlFromEnvExtractor.extractBaseUrls()
    expect(result.isPresent()).toBeTruthy()
    expect(result.get()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it("should return an optional if renderer base url isn't ending with a slash", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org'
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    const result = baseUrlFromEnvExtractor.extractBaseUrls()
    expect(result.isPresent()).toBeTruthy()
    expect(result.get()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it('should copy editor base url to renderer base url if renderer base url is omitted', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    delete process.env.HD_RENDERER_BASE_URL
    const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
    const result = baseUrlFromEnvExtractor.extractBaseUrls()
    expect(result.isPresent()).toBeTruthy()
    expect(result.get()).toStrictEqual({
      renderer: 'https://editor.example.org/',
      editor: 'https://editor.example.org/'
    })
  })
})
