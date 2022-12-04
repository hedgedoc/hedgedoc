/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import { readVarUint8Array } from 'lib0/decoding'
import type { Decoder } from 'lib0/decoding.js'
import {
  createEncoder,
  toUint8Array,
  writeVarUint,
  writeVarUint8Array
} from 'lib0/encoding'
import type { Doc } from 'yjs'
import { applyUpdate } from 'yjs'

export function applyDocumentUpdateMessage(
  decoder: Decoder,
  doc: Doc,
  origin: unknown
): void {
  applyUpdate(doc, readVarUint8Array(decoder), origin)
}

export function encodeDocumentUpdateMessage(
  documentUpdate: Uint8Array
): Uint8Array {
  const encoder = createEncoder()
  writeVarUint(encoder, MessageType.DOCUMENT_UPDATE)
  writeVarUint8Array(encoder, documentUpdate)
  return toUint8Array(encoder)
}
