/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState } from '../message-transporters/message-transporter.js'
import { MessageType } from '../message-transporters/message.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'
import type { Doc } from 'yjs'

export class YDocSyncClientAdapter extends YDocSyncAdapter {
  protected bindDocumentSyncMessageEvents(doc: Doc) {
    super.bindDocumentSyncMessageEvents(doc)

    doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (
        origin !== this &&
        this.messageTransporter.getConnectionState() ===
          ConnectionState.CONNECTED
      ) {
        this.messageTransporter.sendMessage({
          type: MessageType.NOTE_CONTENT_UPDATE,
          payload: Array.from(update)
        })
      }
    })

    this.messageTransporter.on(MessageType.NOTE_CONTENT_UPDATE, () => {
      this.markAsSynced()
    })
  }
}
