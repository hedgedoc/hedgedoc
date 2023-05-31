/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ConnectionState,
  MessageTransporter
} from '../message-transporters/message-transporter.js'
import { Message, MessageType } from '../message-transporters/message.js'

/**
 * Message transporter for testing purposes that redirects message to another in memory connection message transporter instance.
 */
export class InMemoryConnectionMessageTransporter extends MessageTransporter {
  private otherSide: InMemoryConnectionMessageTransporter | undefined

  constructor(private name: string) {
    super()
  }

  public connect(other: InMemoryConnectionMessageTransporter): void {
    this.otherSide = other
    other.otherSide = this
    this.onConnected()
    other.onConnected()
  }

  public disconnect(): void {
    this.onDisconnecting()

    if (this.otherSide) {
      this.otherSide.onDisconnecting()
      this.otherSide.otherSide = undefined
      this.otherSide = undefined
    }
  }

  sendMessage(content: Message<MessageType>): void {
    if (this.otherSide === undefined) {
      throw new Error('Disconnected')
    }
    console.debug(`${this.name}`, 'Sending', content)
    this.otherSide?.receiveMessage(content)
  }

  getConnectionState(): ConnectionState {
    return this.otherSide !== undefined
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECTED
  }
}
