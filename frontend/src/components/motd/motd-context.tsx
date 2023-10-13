'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'
import React from 'react'
import type { MotdApiResponse } from '../global-dialogs/motd-modal/fetch-motd'

const motdContext = createContext<MotdApiResponse | undefined>(undefined)

export const useMotdContextValue = () => {
  return useContext(motdContext)
}

interface MotdProviderProps extends PropsWithChildren {
  motd: MotdApiResponse | undefined
}

export const MotdProvider: React.FC<MotdProviderProps> = ({ children, motd }) => {
  return <motdContext.Provider value={motd}>{children}</motdContext.Provider>
}
