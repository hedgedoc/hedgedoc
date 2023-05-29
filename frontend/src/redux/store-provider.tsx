'use client'
/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from './index'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Provider } from 'react-redux'

/**
 * Sets the redux store for the children components.
 *
 * @param children The child components that should access the redux store
 */
export const StoreProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>
}
