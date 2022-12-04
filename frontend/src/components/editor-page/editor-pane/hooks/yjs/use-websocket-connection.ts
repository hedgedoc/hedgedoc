/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isMockMode } from '../../../../../utils/test-modes'
import { MockConnection } from './mock-connection'
import { useWebsocketUrl } from './use-websocket-url'
import { WebsocketConnection } from './websocket-connection'
import type { YDocMessageTransporter } from '@hedgedoc/commons'
import { useEffect, useMemo } from 'react'
import type { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'

/**
 * Creates a {@link WebsocketConnection websocket connection handler } that handles the realtime communication with the backend.
 *
 * @param yDoc The {@link Doc y-doc} that should be synchronized with the backend
 * @param awareness The {@link Awareness awareness} that should be synchronized with the backend.
 * @return the created connection handler
 */
export const useWebsocketConnection = (yDoc: Doc, awareness: Awareness): YDocMessageTransporter => {
  const websocketUrl = useWebsocketUrl()

  const websocketConnection: YDocMessageTransporter = useMemo(() => {
    return isMockMode ? new MockConnection(yDoc, awareness) : new WebsocketConnection(websocketUrl, yDoc, awareness)
  }, [awareness, websocketUrl, yDoc])

  useEffect(() => {
    const disconnectCallback = () => websocketConnection.disconnect()
    window.addEventListener('beforeunload', disconnectCallback)
    return () => {
      window.removeEventListener('beforeunload', disconnectCallback)
      disconnectCallback()
    }
  }, [websocketConnection])

  return websocketConnection
}
