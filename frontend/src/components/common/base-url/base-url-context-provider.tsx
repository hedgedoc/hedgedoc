/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { createContext, useState } from 'react'
import type { PropsWithChildren } from 'react'

export interface BaseUrls {
  renderer: string
  editor: string
}

interface BaseUrlContextProviderProps {
  baseUrls?: BaseUrls
}

export const baseUrlContext = createContext<BaseUrls | undefined>(undefined)

/**
 * Provides the given base urls as context content and renders an error message if no base urls have been found.
 *
 * @param baseUrls The base urls that should be set in the context
 * @param children The child components that should receive the context value
 */
export const BaseUrlContextProvider: React.FC<PropsWithChildren<BaseUrlContextProviderProps>> = ({
  baseUrls,
  children
}) => {
  const [baseUrlState] = useState<undefined | BaseUrls>(() => baseUrls)

  return baseUrlState === undefined ? (
    <div className={'text-white'}>HedgeDoc is not configured correctly! Please check the server log.</div>
  ) : (
    <baseUrlContext.Provider value={baseUrlState}>{children}</baseUrlContext.Provider>
  )
}
