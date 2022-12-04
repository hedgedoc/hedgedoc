/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionKeepAliveHandler } from './connection-keep-alive-handler.js'
import { YDocMessageTransporter } from './y-doc-message-transporter.js'
import WebSocket from 'isomorphic-ws'
import { Awareness } from 'y-protocols/awareness'
import { Doc } from 'yjs'

export class WebsocketTransporter extends YDocMessageTransporter {
  private websocket: WebSocket | undefined

  constructor(doc: Doc, awareness: Awareness) {
    super(doc, awareness)
    new ConnectionKeepAliveHandler(this)
  }

  public setupWebsocket(websocket: WebSocket) {
    if (
      websocket.readyState === WebSocket.CLOSED ||
      websocket.readyState === WebSocket.CLOSING
    ) {
      throw new Error(`Socket is closed`)
    }
    this.websocket = websocket
    websocket.binaryType = 'arraybuffer'
    websocket.addEventListener('message', (event) =>
      this.decodeMessage(event.data as ArrayBuffer)
    )
    websocket.addEventListener('error', () => this.disconnect())
    websocket.addEventListener('close', () => this.onClose())
    if (websocket.readyState === WebSocket.OPEN) {
      this.onOpen()
    } else {
      websocket.addEventListener('open', this.onOpen.bind(this))
    }
  }

  public disconnect(): void {
    this.websocket?.close()
  }

  public send(content: Uint8Array): void {
    if (this.websocket?.readyState !== WebSocket.OPEN) {
      throw new Error("Can't send message over non-open socket")
    }

    try {
      this.websocket.send(content)
    } catch (error: unknown) {
      this.disconnect()
      throw error
    }
  }

  public isWebSocketOpen(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN
  }
}
