/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import { createEncoder, toUint8Array, writeVarUint } from 'lib0/encoding'

/**
 * Encodes a generic message with a given message type but without content.
 */
export function encodeGenericMessage(messageType: MessageType): Uint8Array {
  const encoder = createEncoder()
  writeVarUint(encoder, messageType)
  return toUint8Array(encoder)
}
