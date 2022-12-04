/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { encodeGenericMessage } from './generic-message.js'
import { MessageType } from './message-type.enum.js'

export function encodeServerVersionUpdatedMessage(): Uint8Array {
  return encodeGenericMessage(MessageType.SERVER_VERSION_UPDATED)
}
