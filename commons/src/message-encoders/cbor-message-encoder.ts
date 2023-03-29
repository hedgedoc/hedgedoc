/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '../message-transporters/message.js'
import { MessageEncoder } from './message-encoder.js'
import { Encoder, Decoder } from 'cbor-x'

interface ReceivedMessage {
  type: number
  payload: unknown
}

const keyMap = {
  type: 0,
  payload: 1,
  users: 2,
  ownUser: 3,
  displayName: 4,
  styleIndex: 5,
  active: 6,
  username: 7,
  cursor: 8,
  from: 9,
  to: 10
}

const messageTypes = Object.values(MessageType)

export class CborMessageEncoder implements MessageEncoder {
  private readonly encoder: Encoder = new Encoder({
    keyMap
  })
  private readonly decoder: Decoder = new Decoder({
    keyMap
  })

  encode(message: Message<MessageType>): Uint8Array {
    const type = messageTypes.indexOf(message.type)
    return this.encoder.encode({
      ...message,
      type
    })
  }

  decode(message: ArrayBuffer): Message<MessageType> {
    const uint8Array = new Uint8Array(message)
    const decoded = this.decoder.decode(uint8Array) as ReceivedMessage
    const type = messageTypes[decoded.type]
    return {
      ...decoded,
      type
    } as Message<MessageType>
  }
}
