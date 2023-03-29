/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageEncoder } from '../message-encoders/message-encoder.js'
import { ConnectionState, MessageTransporter } from './message-transporter.js'
import { Message, MessageType } from './message.js'
import WebSocket, { MessageEvent } from 'isomorphic-ws'

export class WebsocketTransporter extends MessageTransporter {
  private websocket: WebSocket | undefined

  private messageCallback: undefined | ((event: MessageEvent) => void)
  private closeCallback: undefined | (() => void)

  constructor(private readonly encoder: MessageEncoder) {
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

    if (this.isConnected()) {
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
      if (this.closeCallback) {
        this.websocket.removeEventListener('error', this.closeCallback)
        this.websocket.removeEventListener('close', this.closeCallback)
      }
    }
  }

  private bindWebsocketEvents(websocket: WebSocket) {
    this.messageCallback = this.processMessageEvent.bind(this)
    this.closeCallback = this.onDisconnecting.bind(this)

    websocket.addEventListener('message', this.messageCallback)
    websocket.addEventListener('error', this.closeCallback)
    websocket.addEventListener('close', this.closeCallback)
  }

  private processMessageEvent(event: MessageEvent): void {
    const message = this.encoder.decode(event.data)
    this.receiveMessage(message)
  }

  public disconnect(): void {
    this.websocket?.close()
  }

  protected onDisconnecting() {
    if (this.websocket === undefined) {
      return
    }
    this.undbindEventsFromPreviousWebsocket()
    this.websocket = undefined
    super.onDisconnecting()
  }

  public sendMessage(content: Message<MessageType>): void {
    if (!this.isConnected()) {
      this.onDisconnecting()
      console.debug(
        "Can't send message over closed connection. Triggering onDisconencted event. Message that couldn't be sent was",
        content
      )
      return
    }

    if (this.websocket === undefined) {
      throw new Error('websocket transporter has no websocket connection')
    }

    try {
      const encoded = this.encoder.encode(content)
      this.websocket.send(encoded)
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
