/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { getGlobalState } from '../../../../../redux'
import { setRealtimeConnectionState } from '../../../../../redux/realtime/methods'
import { Logger } from '../../../../../utils/logger'
import { isMockMode } from '../../../../../utils/test-modes'
import { useWebsocketUrl } from './use-websocket-url'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MockedBackendMessageTransporter, WebsocketTransporter } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import WebSocket from 'isomorphic-ws'
import { useCallback, useEffect, useMemo, useRef } from 'react'

const logger = new Logger('websocket connection')

/**
 * Creates a {@link WebsocketTransporter websocket message transporter} that handles the realtime communication with the backend.
 *
 * @return the created connection handler
 */
export const useRealtimeConnection = (): MessageTransporter => {
  const websocketUrl = useWebsocketUrl()
  const messageTransporter = useMemo(() => {
    if (isMockMode) {
      logger.debug('Creating Loopback connection...')
      return new MockedBackendMessageTransporter(getGlobalState().noteDetails.markdownContent.plain)
    } else {
      logger.debug('Creating Websocket connection...')
      return new WebsocketTransporter()
    }
  }, [])

  const establishWebsocketConnection = useCallback(() => {
    if (messageTransporter instanceof WebsocketTransporter && websocketUrl) {
      logger.debug(`Connecting to ${websocketUrl.toString()}`)
      messageTransporter.setWebsocket(new WebSocket(websocketUrl))
    }
  }, [messageTransporter, websocketUrl])

  const isConnected = useApplicationState((state) => state.realtimeStatus.isConnected)
  const firstConnect = useRef(true)

  useEffect(() => {
    if (isConnected) {
      return
    }
    if (firstConnect.current) {
      establishWebsocketConnection()
      firstConnect.current = false
    } else {
      setTimeout(() => {
        establishWebsocketConnection()
      }, 3000)
    }
  }, [establishWebsocketConnection, isConnected])

  useEffect(() => {
    const disconnectCallback = () => messageTransporter.disconnect()
    window.addEventListener('beforeunload', disconnectCallback)
    return () => window.removeEventListener('beforeunload', disconnectCallback)
  }, [messageTransporter])

  useEffect(() => {
    const connectedListener = messageTransporter.on('connected', () => setRealtimeConnectionState(true), {
      objectify: true
    }) as Listener
    const disconnectedListener = messageTransporter.on('disconnected', () => setRealtimeConnectionState(false), {
      objectify: true
    }) as Listener

    return () => {
      connectedListener.off()
      disconnectedListener.off()
    }
  }, [messageTransporter])

  return messageTransporter
}
