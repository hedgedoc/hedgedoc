/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { Logger } from './logger'
import { isTestMode, isBuildTime } from './test-modes'
import { parseUrl } from '@hedgedoc/commons'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Extracts and caches the editor and renderer base urls from the environment variables.
 */
export class BaseUrlFromEnvExtractor {
  private baseUrls: BaseUrls | undefined
  private readonly logger = new Logger('Base URL Configuration')

  private extractUrlFromEnvVar(envVarValue: string | undefined): Optional<URL> {
    return parseUrl(envVarValue).orThrow(() => new Error(`${envVarValue} isn't a valid URL`))
  }

  private extractUrlFromEnv(envVarName: string): Optional<URL> {
    if (isTestMode) {
      this.logger.info(`Test mode activated. Using editor base url for ${envVarName}.`)
      return Optional.empty()
    }

    if (!process.env[envVarName]) {
      this.logger.info(`${envVarName} is unset.`)
      return Optional.empty()
    }

    return this.extractUrlFromEnvVar(process.env[envVarName])
  }

  private renewBaseUrls(): BaseUrls {
    return this.extractUrlFromEnvVar(process.env.HD_BASE_URL)
      .map((editorBaseUrl) => {
        const rendererBaseUrl = this.extractUrlFromEnv('HD_RENDERER_BASE_URL').orElse(editorBaseUrl)
        const internalApiUrl = this.extractUrlFromEnv('HD_INTERNAL_API_URL').orElse(undefined)
        return {
          editor: editorBaseUrl.toString(),
          renderer: rendererBaseUrl.toString(),
          internalApiUrl: internalApiUrl?.toString()
        } as BaseUrls
      })
      .orElseThrow(() => new Error("couldn't parse env"))
  }

  /**
   * Extracts the editor and renderer base urls from the environment variables.
   *
   * @return An {@link Optional} with the base urls.
   */
  public extractBaseUrls(): BaseUrls {
    if (isBuildTime) {
      return {
        editor: '',
        renderer: '',
        internalApiUrl: ''
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
    if (this.baseUrls.internalApiUrl !== undefined) {
      this.logger.info('Internal API URL', this.baseUrls.internalApiUrl?.toString())
    }
  }
}

export const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
