/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState } from './message-transporter.js'
import { Message, MessageType } from './message.js'

/**
 * Defines methods that must be implemented to send and receive messages using an {@link AdapterMessageTransporter}.
 */
export interface TransportAdapter {
  getConnectionState(): ConnectionState

  bindOnMessageEvent(handler: (value: Message<MessageType>) => void): () => void

  bindOnConnectedEvent(handler: () => void): () => void

  bindOnErrorEvent(handler: () => void): () => void

  bindOnCloseEvent(handler: () => void): () => void

  disconnect(): void

  send(value: Message<MessageType>): void
}
