/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeDoc } from '../y-doc-sync/index.js'
import { ConnectionState } from './message-transporter.js'
import { Message, MessageType } from './message.js'
import { TransportAdapter } from './transport-adapter.js'

/**
 * Provides a transport adapter that simulates a connection with a real HedgeDoc realtime backend.
 */
export class MockedBackendTransportAdapter implements TransportAdapter {
  private readonly doc: RealtimeDoc

  private connected = true

  private closeHandler: undefined | (() => void)

  private messageHandler: undefined | ((value: Message<MessageType>) => void)

  constructor(initialContent: string) {
    this.doc = new RealtimeDoc(initialContent)
  }

  bindOnCloseEvent(handler: () => void): () => void {
    this.closeHandler = handler
    return () => {
      this.connected = false
      this.closeHandler = undefined
    }
  }

  bindOnConnectedEvent(handler: () => void): () => void {
    handler()
    return () => {
      //empty on purpose
    }
  }

  bindOnErrorEvent(): () => void {
    return () => {
      //empty on purpose
    }
  }

  bindOnMessageEvent(
    handler: (value: Message<MessageType>) => void,
  ): () => void {
    this.messageHandler = handler
    return () => {
      this.messageHandler = undefined
    }
  }

  disconnect(): void {
    if (!this.connected) {
      return
    }
    this.connected = false
    this.closeHandler?.()
  }

  getConnectionState(): ConnectionState {
    return this.connected
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECTED
  }

  send(value: Message<MessageType>): void {
    if (value.type === MessageType.NOTE_CONTENT_STATE_REQUEST) {
      setTimeout(
        () =>
          this.messageHandler?.({
            type: MessageType.NOTE_CONTENT_UPDATE,
            payload: this.doc.encodeStateAsUpdate(value.payload),
          }),
        0,
      )
    } else if (value.type === MessageType.READY_REQUEST) {
      setTimeout(
        () =>
          this.messageHandler?.({
            type: MessageType.READY_ANSWER,
          }),
        0,
      )
    }
  }
}
