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

let baseUrls: BaseUrls | undefined = undefined
const logger = new Logger('Base URL Configuration')

function extractUrlFromEnvVar(envVarName: string, envVarValue: string | undefined): Optional<URL> {
  try {
    return parseUrl(envVarValue)
  } catch (error) {
    if (error instanceof NoSubdirectoryAllowedError) {
      logger.error(error.message)
      return Optional.empty()
    } else {
      throw error
    }
  }
}

function extractEditorBaseUrlFromEnv(): Optional<URL> {
  const envValue = extractUrlFromEnvVar('HD_BASE_URL', process.env.HD_BASE_URL)
  if (envValue.isEmpty()) {
    logger.error("HD_BASE_URL isn't a valid URL!")
  }
  return envValue
}

function extractRendererBaseUrlFromEnv(editorBaseUrl: URL): Optional<URL> {
  if (isTestMode) {
    logger.info('Test mode activated. Using editor base url for renderer.')
    return Optional.of(editorBaseUrl)
  }

  if (!process.env.HD_RENDERER_BASE_URL) {
    logger.info('HD_RENDERER_BASE_URL is unset. Using editor base url for renderer.')
    return Optional.of(editorBaseUrl)
  }

  return extractUrlFromEnvVar('HD_RENDERER_BASE_URL', process.env.HD_RENDERER_BASE_URL)
}

function renewBaseUrls(): BaseUrls {
  return extractEditorBaseUrlFromEnv()
    .flatMap((editorBaseUrl) =>
      extractRendererBaseUrlFromEnv(editorBaseUrl).map((rendererBaseUrl) => {
        return {
          editor: editorBaseUrl.toString(),
          renderer: rendererBaseUrl.toString()
        }
      })
    )
    .orElseThrow(() => new Error('couldnt parse env vars'))
}

function logBaseUrls() {
  if (baseUrls === undefined) {
    return
  }
  logger.info('Editor base URL', baseUrls.editor.toString())
  logger.info('Renderer base URL', baseUrls.renderer.toString())
}

/**
 * Extracts the editor and renderer base urls from the environment variables.
 *
 * @return An {@link Optional} with the base urls.
 */
export function extractBaseUrls(): BaseUrls {
  if (isBuildTime) {
    return {
      editor: 'https://example.org/',
      renderer: 'https://example.org/'
    }
  }

  if (baseUrls === undefined) {
    baseUrls = renewBaseUrls()
    logBaseUrls()
  }
  return baseUrls
}
