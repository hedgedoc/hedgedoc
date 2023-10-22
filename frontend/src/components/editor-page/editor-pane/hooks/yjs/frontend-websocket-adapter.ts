/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DisconnectReason, Message, MessageType, TransportAdapter } from '@hedgedoc/commons'
import { ConnectionState } from '@hedgedoc/commons'

/**
 * Implements a transport adapter that communicates using a browser websocket.
 */
export class FrontendWebsocketAdapter implements TransportAdapter {
  constructor(private socket: WebSocket) {}

  bindOnCloseEvent(handler: (reason?: DisconnectReason) => void): () => void {
    const callback = (event: CloseEvent): void => handler(event.code)
    this.socket.addEventListener('close', callback)
    return () => {
      this.socket.removeEventListener('close', callback)
    }
  }

  bindOnConnectedEvent(handler: () => void): () => void {
    this.socket.addEventListener('open', handler)
    return () => {
      this.socket.removeEventListener('open', handler)
    }
  }

  bindOnErrorEvent(handler: () => void): () => void {
    this.socket.addEventListener('error', handler)
    return () => {
      this.socket.removeEventListener('error', handler)
    }
  }

  bindOnMessageEvent(handler: (value: Message<MessageType>) => void): () => void {
    function processStringAsMessage(message: MessageEvent): void {
      if (typeof message.data !== 'string') {
        return
      }

      handler(JSON.parse(message.data) as Message<MessageType>)
    }

    this.socket.addEventListener('message', processStringAsMessage)
    return () => {
      this.socket.removeEventListener('message', processStringAsMessage)
    }
  }

  disconnect(): void {
    this.socket.close()
  }

  getConnectionState(): ConnectionState {
    if (this.socket.readyState === WebSocket.OPEN) {
      return ConnectionState.CONNECTED
    } else if (this.socket.readyState === WebSocket.CONNECTING) {
      return ConnectionState.CONNECTING
    } else {
      return ConnectionState.DISCONNECTED
    }
  }

  send(value: Message<MessageType>): void {
    this.socket.send(JSON.stringify(value))
  }
}
