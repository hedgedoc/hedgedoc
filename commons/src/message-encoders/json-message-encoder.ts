/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '../message-transporters/message.js'
import { MessageEncoder } from './message-encoder.js'

export class JsonMessageEncoder implements MessageEncoder {
  public encode(message: Message<MessageType>): string {
    return JSON.stringify(message)
  }

  public decode(message: string): Message<MessageType> {
    return JSON.parse(message) as Message<MessageType>
  }
}
