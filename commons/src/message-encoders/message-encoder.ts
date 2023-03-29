/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '../message-transporters/message.js'
import WebSocket from 'isomorphic-ws'

export abstract class MessageEncoder {
  public abstract encode(message: Message<MessageType>): WebSocket.Data

  public abstract decode(message: WebSocket.Data): Message<MessageType>
}
