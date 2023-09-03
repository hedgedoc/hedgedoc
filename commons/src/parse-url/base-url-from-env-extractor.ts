/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isTestMode, isBuildTime, Logger } from '../utils/index.js'
import { parseUrl } from './parse-url.js'
import { NoValidUrlError } from './errors.js'
import { Optional } from '@mrdrogdrog/optional'
import { BaseUrls } from './base-urls.types.js'

/**
 * Extracts and caches the editor and renderer base urls from the environment variables.
 */
export class BaseUrlFromEnvExtractor {
  private baseUrls: BaseUrls | undefined
  private readonly logger: Logger | undefined

  constructor(withLogging: boolean = true) {
    this.logger = withLogging ? new Logger('Base URL Configuration') : undefined
  }

  private extractEditorBaseUrlFromEnv(): URL {
    return parseUrl(process.env.HD_BASE_URL).orElseThrow(
      () => new NoValidUrlError('HD_BASE_URL')
    )
  }

  private extractExtraUrlFromEnv(envVarName: string, editorBaseUrl: URL): URL {
    if (isTestMode) {
      this.logger?.info('Test mode activated. Using editor base url.')
      return editorBaseUrl
    }

    const rendererBaseUrl = Optional.ofNullable(process.env[envVarName])
      .filter((value) => value !== '')
      .map((value) =>
        parseUrl(value).orElseThrow(() => new NoValidUrlError(envVarName))
      )
      .orElse(undefined)

    if (rendererBaseUrl === undefined) {
      this.logger?.info(
        `${envVarName} is unset. Using editor base url for renderer.`
      )
      return editorBaseUrl
    } else {
      return rendererBaseUrl
    }
  }

  private renewBaseUrls(): BaseUrls {
    const editorBaseUrl = this.extractEditorBaseUrlFromEnv()
    const rendererBaseUrl = this.extractExtraUrlFromEnv(
      'HD_RENDERER_BASE_URL',
      editorBaseUrl
    )
    const ssrApiUrl = this.extractExtraUrlFromEnv(
      'HD_SSR_API_URL',
      editorBaseUrl
    )

    return {
      editor: editorBaseUrl.toString(),
      renderer: rendererBaseUrl.toString(),
      ssrApi: ssrApiUrl.toString()
    }
  }

  /**
   * Extracts the editor and renderer base urls from the environment variables.
   *
   * @return An {@link Optional} with the base urls.
   */
  public extractBaseUrls(): BaseUrls {
    if (isBuildTime) {
      return {
        editor: 'https://example.org/',
        renderer: 'https://example.org/',
        ssrApi: 'https://example.org/'
      }
    }

    if (this.baseUrls === undefined) {
      this.baseUrls = this.renewBaseUrls()
      this.logBaseUrls()
    }
    return this.baseUrls
  }

  private logBaseUrls() {
    if (this.baseUrls === undefined) {
      return
    }
    this.logger?.info('Editor base URL', this.baseUrls.editor.toString())
    this.logger?.info('Renderer base URL', this.baseUrls.renderer.toString())
  }
}
