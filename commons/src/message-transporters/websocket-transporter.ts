/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState, MessageTransporter } from './message-transporter.js'
import { Message, MessageType } from './message.js'
import WebSocket, { CloseEvent, ErrorEvent, MessageEvent } from 'isomorphic-ws'

export class WebsocketTransporter extends MessageTransporter {
  private websocket: WebSocket | undefined

  private messageCallback: undefined | ((event: MessageEvent) => void)
  private errorCallback: undefined | ((event: ErrorEvent) => void)
  private closeCallback: undefined | ((event: CloseEvent) => void)

  constructor() {
    super()
  }

  public setWebsocket(websocket: WebSocket) {
    if (
      websocket.readyState === WebSocket.CLOSED ||
      websocket.readyState === WebSocket.CLOSING
    ) {
      throw new Error('Websocket must be open')
    }
    this.undbindEventsFromPreviousWebsocket()
    this.websocket = websocket
    this.bindWebsocketEvents(websocket)

    if (this.websocket.readyState === WebSocket.OPEN) {
      this.onConnected()
    } else {
      this.websocket.addEventListener('open', this.onConnected.bind(this))
    }
  }

  private undbindEventsFromPreviousWebsocket() {
    if (this.websocket) {
      if (this.messageCallback) {
        this.websocket.removeEventListener('message', this.messageCallback)
      }
      if (this.errorCallback) {
        this.websocket.removeEventListener('error', this.errorCallback)
      }
      if (this.closeCallback) {
        this.websocket.removeEventListener('close', this.closeCallback)
      }
    }
  }

  private bindWebsocketEvents(websocket: WebSocket) {
    this.messageCallback = this.processMessageEvent.bind(this)
    this.errorCallback = this.disconnect.bind(this)
    this.closeCallback = this.onDisconnecting.bind(this)

    websocket.addEventListener('message', this.messageCallback)
    websocket.addEventListener('error', this.errorCallback)
    websocket.addEventListener('close', this.closeCallback)
  }

  private processMessageEvent(event: MessageEvent): void {
    if (typeof event.data !== 'string') {
      return
    }
    const message = JSON.parse(event.data) as Message<MessageType>
    this.receiveMessage(message)
  }

  public disconnect(): void {
    this.websocket?.close()
  }

  public sendMessage(content: Message<MessageType>): void {
    if (this.websocket?.readyState !== WebSocket.OPEN) {
      throw new Error("Can't send message over non-open socket")
    }

    try {
      this.websocket.send(JSON.stringify(content))
    } catch (error: unknown) {
      this.disconnect()
      throw error
    }
  }

  public getConnectionState(): ConnectionState {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return ConnectionState.CONNECTED
    } else if (this.websocket?.readyState === WebSocket.CONNECTING) {
      return ConnectionState.CONNECTING
    } else {
      return ConnectionState.DISCONNECT
    }
  }
}
