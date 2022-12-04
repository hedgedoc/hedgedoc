/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { Logger } from './logger'
import { isTestMode } from './test-modes'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Extracts the editor and renderer base urls from the environment variables.
 */
export class BaseUrlFromEnvExtractor {
  private baseUrls: Optional<BaseUrls> | undefined
  private logger = new Logger('Base URL Configuration')

  private extractUrlFromEnvVar(envVarName: string, envVarValue: string | undefined): Optional<URL> {
    return Optional.ofNullable(envVarValue)
      .filter((value) => {
        const endsWithSlash = value.endsWith('/')
        if (!endsWithSlash) {
          this.logger.error(`${envVarName} must end with an '/'`)
        }
        return endsWithSlash
      })
      .map((value) => {
        try {
          return new URL(value)
        } catch (error) {
          return null
        }
      })
  }

  private extractEditorBaseUrlFromEnv(): Optional<URL> {
    const envValue = this.extractUrlFromEnvVar('HD_EDITOR_BASE_URL', process.env.HD_EDITOR_BASE_URL)
    if (envValue.isEmpty()) {
      this.logger.error("HD_EDITOR_BASE_URL isn't a valid URL!")
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

  private renewBaseUrls(): void {
    this.baseUrls = this.extractEditorBaseUrlFromEnv().flatMap((editorBaseUrl) =>
      this.extractRendererBaseUrlFromEnv(editorBaseUrl).map((rendererBaseUrl) => {
        return {
          editor: editorBaseUrl.toString(),
          renderer: rendererBaseUrl.toString()
        }
      })
    )
    this.baseUrls.ifPresent((urls) => {
      this.logger.info('Editor base URL', urls.editor.toString())
      this.logger.info('Renderer base URL', urls.renderer.toString())
    })
  }

  private isEnvironmentExtractDone(): boolean {
    return this.baseUrls !== undefined
  }

  /**
   * Extracts the editor and renderer base urls from the environment variables.
   *
   * @return An {@link Optional} with the base urls.
   */
  public extractBaseUrls(): Optional<BaseUrls> {
    if (!this.isEnvironmentExtractDone()) {
      this.renewBaseUrls()
    }
    return Optional.ofNullable(this.baseUrls).flatMap((value) => value)
  }
}
