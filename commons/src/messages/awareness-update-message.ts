/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import type { Decoder } from 'lib0/decoding'
import { readVarUint8Array } from 'lib0/decoding'
import {
  createEncoder,
  toUint8Array,
  writeVarUint,
  writeVarUint8Array
} from 'lib0/encoding'
import type { Awareness } from 'y-protocols/awareness'
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate
} from 'y-protocols/awareness'

export function applyAwarenessUpdateMessage(
  decoder: Decoder,
  awareness: Awareness,
  origin: unknown
): void {
  applyAwarenessUpdate(awareness, readVarUint8Array(decoder), origin)
}

export function encodeAwarenessUpdateMessage(
  awareness: Awareness,
  updatedClientIds: number[]
): Uint8Array {
  const encoder = createEncoder()
  writeVarUint(encoder, MessageType.AWARENESS_UPDATE)
  writeVarUint8Array(
    encoder,
    encodeAwarenessUpdate(awareness, updatedClientIds)
  )
  return toUint8Array(encoder)
}
