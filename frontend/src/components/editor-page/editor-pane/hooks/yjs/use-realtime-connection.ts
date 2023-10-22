/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { getGlobalState } from '../../../../../redux'
import { setRealtimeConnectionState } from '../../../../../redux/realtime/methods'
import { Logger } from '../../../../../utils/logger'
import { isMockMode } from '../../../../../utils/test-modes'
import { FrontendWebsocketAdapter } from './frontend-websocket-adapter'
import { useWebsocketUrl } from './use-websocket-url'
import { DisconnectReason, MessageTransporter, MockedBackendTransportAdapter } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useCallback, useEffect, useMemo, useRef } from 'react'

const logger = new Logger('websocket connection')
const WEBSOCKET_RECONNECT_INTERVAL = 2000
const WEBSOCKET_RECONNECT_MAX_DURATION = 5000

/**
 * Creates a {@link MessageTransporter message transporter} that handles the realtime communication with the backend.
 *
 * @return the created connection handler
 */
export const useRealtimeConnection = (): MessageTransporter => {
  const websocketUrl = useWebsocketUrl()
  const messageTransporter = useMemo(() => new MessageTransporter(), [])

  const reconnectCount = useRef(0)
  const disconnectReason = useRef<DisconnectReason | undefined>(undefined)
  const establishWebsocketConnection = useCallback(() => {
    if (isMockMode) {
      logger.debug('Creating Loopback connection...')
      messageTransporter.setAdapter(
        new MockedBackendTransportAdapter(getGlobalState().noteDetails?.markdownContent.plain ?? '')
      )
    } else if (websocketUrl) {
      logger.debug(`Connecting to ${websocketUrl.toString()}`)

      const socket = new WebSocket(websocketUrl.toString())
      socket.addEventListener('error', () => {
        const timeout = WEBSOCKET_RECONNECT_INTERVAL + reconnectCount.current * 1000 + Math.random() * 1000
        setTimeout(
          () => {
            reconnectCount.current += 1
            establishWebsocketConnection()
          },
          Math.max(timeout, WEBSOCKET_RECONNECT_MAX_DURATION)
        )
      })
      socket.addEventListener('open', () => {
        messageTransporter.setAdapter(new FrontendWebsocketAdapter(socket))
      })
    }
  }, [messageTransporter, websocketUrl])

  const isConnected = useApplicationState((state) => state.realtimeStatus.isConnected)

  useEffect(() => {
    if (isConnected || reconnectCount.current > 0 || disconnectReason.current === DisconnectReason.USER_NOT_PERMITTED) {
      return
    }
    establishWebsocketConnection()
  }, [establishWebsocketConnection, isConnected])

  useEffect(() => {
    const readyListener = messageTransporter.doAsSoonAsReady(() => {
      reconnectCount.current = 0
    })

    messageTransporter.on('connected', () => logger.debug(`Connected`))
    messageTransporter.on('disconnected', () => logger.debug(`Disconnected`))

    return () => {
      readyListener.off()
    }
  }, [messageTransporter])

  useEffect(() => {
    const disconnectCallback = () => messageTransporter.disconnect()
    window.addEventListener('beforeunload', disconnectCallback)
    return () => window.removeEventListener('beforeunload', disconnectCallback)
  }, [messageTransporter])

  useEffect(() => () => messageTransporter.disconnect(), [messageTransporter])

  useEffect(() => {
    const connectedListener = messageTransporter.doAsSoonAsReady(() => setRealtimeConnectionState(true))
    const disconnectedListener = messageTransporter.on(
      'disconnected',
      (reason?: DisconnectReason) => {
        disconnectReason.current = reason
        setRealtimeConnectionState(false)
      },
      {
        objectify: true
      }
    ) as Listener

    return () => {
      connectedListener.off()
      disconnectedListener.off()
    }
  }, [messageTransporter])

  return messageTransporter
}
