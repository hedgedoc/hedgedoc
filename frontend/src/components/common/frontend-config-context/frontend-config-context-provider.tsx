/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfigDto } from '@hedgedoc/commons'
import { frontendConfigContext } from './context'
import type { PropsWithChildren } from 'react'
import React from 'react'

interface FrontendConfigContextProviderProps extends PropsWithChildren {
  config?: FrontendConfigDto
}

/**
 * Provides the given frontend configuration in a context or renders an error message otherwise.
 *
 * @param config the frontend config to provoide
 * @param children the react elements to show if the config is valid
 */
export const FrontendConfigContextProvider: React.FC<FrontendConfigContextProviderProps> = ({ config, children }) => {
  return config === undefined ? (
    <span className={'text-white bg-dark'}>No frontend config received! Please check the server log.</span>
  ) : (
    <frontendConfigContext.Provider value={config}>{children}</frontendConfigContext.Provider>
  )
}
