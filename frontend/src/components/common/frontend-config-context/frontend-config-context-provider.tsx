/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getConfig } from '../../../api/config'
import type { FrontendConfig } from '../../../api/config/types'
import { useBaseUrl } from '../../../hooks/common/use-base-url'
import { Logger } from '../../../utils/logger'
import { frontendConfigContext } from './context'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useState } from 'react'

const logger = new Logger('FrontendConfigContextProvider')

interface FrontendConfigContextProviderProps extends PropsWithChildren {
  config?: FrontendConfig
}

/**
 * Provides the given frontend configuration in a context or renders an error message otherwise.
 *
 * @param config the frontend config to provoide
 * @param children the react elements to show if the config is valid
 */
export const FrontendConfigContextProvider: React.FC<FrontendConfigContextProviderProps> = ({ config, children }) => {
  const [configState, setConfigState] = useState<undefined | FrontendConfig>(() => config)

  const baseUrl = useBaseUrl()

  useEffect(() => {
    if (config === undefined && configState === undefined) {
      logger.debug('Fetching Config client side')
      getConfig(baseUrl)
        .then((config) => setConfigState(config))
        .catch((error) => logger.error(error))
    }
  }, [baseUrl, config, configState])

  return configState === undefined ? (
    <span className={'text-white bg-dark'}>No frontend config received! Please check the server log.</span>
  ) : (
    <frontendConfigContext.Provider value={configState}>{children}</frontendConfigContext.Provider>
  )
}
