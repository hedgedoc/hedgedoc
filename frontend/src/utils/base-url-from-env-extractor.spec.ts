/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'

describe('BaseUrlFromEnvExtractor', () => {
  let extractBaseUrls: () => BaseUrls

  beforeEach(async () => {
    jest.resetModules()
    extractBaseUrls = (await import('./base-url-from-env-extractor')).extractBaseUrls
  })

  it('should return the base urls if both are valid urls', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'

    expect(extractBaseUrls()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it('should return an empty optional if no var is set', () => {
    process.env.HD_BASE_URL = undefined
    process.env.HD_RENDERER_BASE_URL = undefined

    expect(() => extractBaseUrls()).toThrow()
  })

  it("should return an empty optional if editor base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'bibedibabedibu'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'

    expect(() => extractBaseUrls()).toThrow()
  })

  it("should return an empty optional if renderer base url isn't an URL", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'bibedibabedibu'

    expect(() => extractBaseUrls()).toThrow()
  })

  it("should return an optional if editor base url isn't ending with a slash", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org/'

    expect(extractBaseUrls()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it("should return an optional if renderer base url isn't ending with a slash", () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    process.env.HD_RENDERER_BASE_URL = 'https://renderer.example.org'

    expect(extractBaseUrls()).toStrictEqual({
      renderer: 'https://renderer.example.org/',
      editor: 'https://editor.example.org/'
    })
  })

  it('should copy editor base url to renderer base url if renderer base url is omitted', () => {
    process.env.HD_BASE_URL = 'https://editor.example.org/'
    delete process.env.HD_RENDERER_BASE_URL

    expect(extractBaseUrls()).toStrictEqual({
      renderer: 'https://editor.example.org/',
      editor: 'https://editor.example.org/'
    })
  })
})
