/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { Logger } from './logger'
import { isTestMode, isBuildTime } from '@hedgedoc/commons'
import { NoSubdirectoryAllowedError, parseUrl } from '@hedgedoc/commons'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Extracts and caches the editor and renderer base urls from the environment variables.
 */
export class BaseUrlFromEnvExtractor {
  private baseUrls: BaseUrls | undefined
  private readonly logger = new Logger('Base URL Configuration')

  private extractUrlFromEnvVar(envVarName: string, envVarValue: string | undefined): Optional<URL> {
    try {
      return parseUrl(envVarValue)
    } catch (error) {
      if (error instanceof NoSubdirectoryAllowedError) {
        this.logger.error(error.message)
        return Optional.empty()
      } else {
        throw error
      }
    }
  }

  private extractEditorBaseUrlFromEnv(): Optional<URL> {
    const envValue = this.extractUrlFromEnvVar('HD_BASE_URL', process.env.HD_BASE_URL)
    if (envValue.isEmpty()) {
      this.logger.error("HD_BASE_URL isn't a valid URL!")
    }
    return envValue
  }

  private extractRendererBaseUrlFromEnv(editorBaseUrl: URL): Optional<URL> {
    if (isTestMode) {
      this.logger.info('Test mode activated. Using editor base url for renderer.')
      return Optional.of(editorBaseUrl)
    }

    if (!process.env.HD_RENDERER_BASE_URL) {
      this.logger.info('HD_RENDERER_BASE_URL is unset. Using editor base url for renderer.')
      return Optional.of(editorBaseUrl)
    }

    return this.extractUrlFromEnvVar('HD_RENDERER_BASE_URL', process.env.HD_RENDERER_BASE_URL)
  }

  private renewBaseUrls(): BaseUrls {
    return this.extractEditorBaseUrlFromEnv()
      .flatMap((editorBaseUrl) =>
        this.extractRendererBaseUrlFromEnv(editorBaseUrl).map((rendererBaseUrl) => {
          return {
            editor: editorBaseUrl.toString(),
            renderer: rendererBaseUrl.toString()
          }
        })
      )
      .orElseThrow(() => new Error('couldnt parse env vars'))
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
        renderer: 'https://example.org/'
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
    this.logger.info('Editor base URL', this.baseUrls.editor.toString())
    this.logger.info('Renderer base URL', this.baseUrls.renderer.toString())
  }
}

export const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
