/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { resetRealtimeStatus } from '../../redux/realtime/methods'
import { LoadingScreen } from '../application-loader/loading-screen/loading-screen'
import type { PropsWithChildren } from 'react'
import React, { Fragment, useEffect, useState } from 'react'

export const ResetGlobalStateBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  const [globalStateInitialized, setGlobalStateInitialized] = useState(false)
  useEffect(() => {
    resetRealtimeStatus()
    setGlobalStateInitialized(true)
  }, [])
  if (!globalStateInitialized) {
    return <LoadingScreen />
  } else {
    return <Fragment>{children}</Fragment>
  }
}
