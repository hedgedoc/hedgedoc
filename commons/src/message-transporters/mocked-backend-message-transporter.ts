/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeDoc } from '../y-doc-sync/realtime-doc.js'
import { ConnectionState, MessageTransporter } from './message-transporter.js'
import { Message, MessageType } from './message.js'

/**
 * A mocked connection that doesn't send or receive any data and is instantly ready.
 * The only exception is the note content state request that is answered with the given initial content.
 */
export class MockedBackendMessageTransporter extends MessageTransporter {
  private readonly doc: RealtimeDoc

  private connected = true

  constructor(initialContent: string) {
    super()
    this.doc = new RealtimeDoc(initialContent)

    this.onConnected()
  }

  disconnect(): void {
    if (!this.connected) {
      return
    }
    this.connected = false
    this.onDisconnecting()
  }

  sendReady() {
    this.receiveMessage({
      type: MessageType.READY
    })
  }

  sendMessage<M extends MessageType>(content: Message<M>) {
    if (content.type === MessageType.NOTE_CONTENT_STATE_REQUEST) {
      setTimeout(() => {
        this.receiveMessage({
          type: MessageType.NOTE_CONTENT_UPDATE,
          payload: this.doc.encodeStateAsUpdate(content.payload)
        })
      }, 10)
    }
  }

  getConnectionState(): ConnectionState {
    return this.connected
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECT
  }
}
