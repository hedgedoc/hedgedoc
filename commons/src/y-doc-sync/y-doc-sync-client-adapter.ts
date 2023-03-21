/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from '../message-transporters/message.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'
import type { Doc } from 'yjs'

export class YDocSyncClientAdapter extends YDocSyncAdapter {
  protected bindDocumentSyncMessageEvents(doc: Doc) {
    super.bindDocumentSyncMessageEvents(doc)

    this.messageTransporter.on(MessageType.NOTE_CONTENT_UPDATE, () => {
      this.markAsSynced()
    })
  }
}
