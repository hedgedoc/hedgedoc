/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './message-type.enum.js'
import {
  createEncoder,
  toUint8Array,
  writeVarUint,
  writeVarUint8Array
} from 'lib0/encoding'
import type { Doc } from 'yjs'
import { encodeStateVector } from 'yjs'

export function encodeCompleteDocumentStateRequestMessage(
  doc: Doc
): Uint8Array {
  const encoder = createEncoder()
  writeVarUint(encoder, MessageType.COMPLETE_DOCUMENT_STATE_REQUEST)
  writeVarUint8Array(encoder, encodeStateVector(doc))
  return toUint8Array(encoder)
}
