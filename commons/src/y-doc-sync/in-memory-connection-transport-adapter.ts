/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TransportAdapter } from '../message-transporters/index.js'
import { ConnectionState } from '../message-transporters/index.js'
import { Message, MessageType } from '../message-transporters/message.js'

/**
 * Message transporter for testing purposes that redirects message to another in memory connection message transporter instance.
 */
export class InMemoryConnectionTransportAdapter implements TransportAdapter {
  private otherSide: InMemoryConnectionTransportAdapter | undefined

  private onCloseHandler: undefined | (() => void)
  private onConnectedHandler: undefined | (() => void)
  private onErrorHandler: undefined | (() => void)
  private onMessageHandler: undefined | ((value: Message<MessageType>) => void)

  constructor(private name: string) {}

  getConnectionState(): ConnectionState {
    return this.otherSide !== undefined
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECTED
  }

  bindOnCloseEvent(handler: () => void): () => void {
    this.onCloseHandler = handler
    return () => (this.onCloseHandler = undefined)
  }

  bindOnConnectedEvent(handler: () => void): () => void {
    this.onConnectedHandler = handler
    return () => (this.onConnectedHandler = undefined)
  }

  bindOnErrorEvent(handler: () => void): () => void {
    this.onErrorHandler = handler
    return () => (this.onErrorHandler = undefined)
  }

  bindOnMessageEvent(
    handler: (value: Message<MessageType>) => void,
  ): () => void {
    this.onMessageHandler = handler
    return () => (this.onMessageHandler = undefined)
  }

  receiveMessage(content: Message<MessageType>): void {
    this.onMessageHandler?.(content)
  }

  send(content: Message<MessageType>): void {
    if (this.otherSide === undefined) {
      throw new Error('Disconnected')
    }
    console.debug(`${this.name}`, 'Sending', content)
    this.otherSide?.receiveMessage(content)
  }

  public connect(other: InMemoryConnectionTransportAdapter): void {
    this.otherSide = other
    other.otherSide = this
  }

  disconnect(): void {
    this.onCloseHandler?.()

    if (this.otherSide) {
      this.otherSide.onCloseHandler?.()
      this.otherSide.otherSide = undefined
      this.otherSide = undefined
    }
  }
}
