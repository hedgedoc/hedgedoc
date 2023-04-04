/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getConfig } from '../api/config'
import type { FrontendConfig } from '../api/config/types'
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { Logger } from './logger'

/**
 * Fetches and caches the {@link FrontendConfig frontend config} from the backend.
 */
export class FrontendConfigFetcher {
  private readonly logger = new Logger('Frontend config fetcher')

  private frontendConfig: FrontendConfig | undefined = undefined

  public async fetch(baseUrls: BaseUrls | undefined): Promise<FrontendConfig | undefined> {
    if (!this.frontendConfig) {
      if (baseUrls === undefined) {
        return undefined
      }
      const baseUrl = baseUrls.editor.toString()
      try {
        this.frontendConfig = await getConfig(baseUrl)
      } catch (error) {
        this.logger.error(`Couldn't fetch frontend configuration from ${baseUrl}`, error)
        return undefined
      }
      this.logger.info(`Fetched frontend config from ${baseUrl}`)
    }
    return this.frontendConfig
  }
}
