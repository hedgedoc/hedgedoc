/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { Logger } from './logger'
import { isTestMode, isBuildTime } from './test-modes'
import { NoSubdirectoryAllowedError, parseUrl } from '@hedgedoc/commons'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Extracts and caches the editor and renderer base urls from the environment variables.
 */
export class BaseUrlFromEnvExtractor {
  private baseUrls: BaseUrls | undefined
  private readonly logger = new Logger('Base URL Configuration')

  private extractUrlFromEnvVar(envVarValue: string | undefined): Optional<URL> {
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
    const envValue = this.extractUrlFromEnvVar(process.env.HD_BASE_URL)
    if (envValue.isEmpty()) {
      this.logger.error("HD_BASE_URL isn't a valid URL!")
    }
    return envValue
  }

  private extractUrlFromEnv(editorBaseUrl: URL, envVarName: string): Optional<URL> {
    if (isTestMode) {
      this.logger.info(`Test mode activated. Using editor base url for ${envVarName}.`)
      return Optional.of(editorBaseUrl)
    }

    if (!process.env[envVarName]) {
      this.logger.info(`${envVarName} is unset. Using editor base url.`)
      return Optional.of(editorBaseUrl)
    }

    return this.extractUrlFromEnvVar(process.env[envVarName])
  }

  private renewBaseUrls(): BaseUrls {
    return this.extractEditorBaseUrlFromEnv()
      .flatMap((editorBaseUrl) =>
        this.extractUrlFromEnv(editorBaseUrl, 'HD_RENDERER_BASE_URL').flatMap((rendererBaseUrl) =>
          this.extractUrlFromEnv(editorBaseUrl, 'HD_INTERNAL_API_URL').map((internalApiUrl) => {
            return {
              editor: editorBaseUrl.toString(),
              renderer: rendererBaseUrl.toString(),
              internalApiUrl: internalApiUrl.toString()
            }
          })
        )
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
        renderer: 'https://example.org/',
        internalApiUrl: 'https://example.org/'
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
    this.logger.info('Internal API URL', this.baseUrls.internalApiUrl.toString())
  }
}

export const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
