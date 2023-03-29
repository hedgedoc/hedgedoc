/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { getGlobalState } from '../../../../../redux'
import { setRealtimeConnectionState } from '../../../../../redux/realtime/methods'
import { Logger } from '../../../../../utils/logger'
import { isMockMode, isDevMode } from '../../../../../utils/test-modes'
import { useWebsocketUrl } from './use-websocket-url'
import type { MessageTransporter } from '@hedgedoc/commons'
import {
  CborMessageEncoder,
  JsonMessageEncoder,
  MockedBackendMessageTransporter,
  WebsocketTransporter
} from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import WebSocket from 'isomorphic-ws'
import { useCallback, useEffect, useMemo, useRef } from 'react'

const logger = new Logger('websocket connection')
const WEBSOCKET_RECONNECT_INTERVAL = 3000

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
      const encoder = isDevMode ? new JsonMessageEncoder() : new CborMessageEncoder()
      return new WebsocketTransporter(encoder)
    }
  }, [])

  const establishWebsocketConnection = useCallback(() => {
    if (messageTransporter instanceof WebsocketTransporter && websocketUrl) {
      logger.debug(`Connecting to ${websocketUrl.toString()}`)
      const socket = new WebSocket(websocketUrl)
      socket.binaryType = 'arraybuffer'
      socket.addEventListener('error', () => {
        setTimeout(() => {
          establishWebsocketConnection()
        }, WEBSOCKET_RECONNECT_INTERVAL)
      })
      socket.addEventListener('open', () => {
        messageTransporter.setWebsocket(socket)
      })
    }
  }, [messageTransporter, websocketUrl])

  const isConnected = useApplicationState((state) => state.realtimeStatus.isConnected)
  const firstConnect = useRef(true)

  const reconnectTimeout = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (isConnected) {
      return
    }
    if (firstConnect.current) {
      establishWebsocketConnection()
      firstConnect.current = false
    } else {
      reconnectTimeout.current = window.setTimeout(() => {
        establishWebsocketConnection()
      }, WEBSOCKET_RECONNECT_INTERVAL)
    }
  }, [establishWebsocketConnection, isConnected, messageTransporter])

  useEffect(() => {
    const readyListener = messageTransporter.doAsSoonAsReady(() => {
      const timerId = reconnectTimeout.current
      if (timerId !== undefined) {
        window.clearTimeout(timerId)
      }
      reconnectTimeout.current = undefined
    })

    messageTransporter.on('connected', () => logger.debug(`Connected`))
    messageTransporter.on('disconnected', () => logger.debug(`Disconnected`))

    return () => {
      const interval = reconnectTimeout.current
      interval && window.clearTimeout(interval)
      readyListener.off()
    }
  }, [messageTransporter])

  useEffect(() => {
    const disconnectCallback = () => messageTransporter.disconnect()
    window.addEventListener('beforeunload', disconnectCallback)
    return () => window.removeEventListener('beforeunload', disconnectCallback)
  }, [messageTransporter])

  useEffect(() => {
    const connectedListener = messageTransporter.doAsSoonAsReady(() => setRealtimeConnectionState(true))
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
