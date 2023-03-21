/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from '../message-transporters/message.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'

export class YDocSyncClientAdapter extends YDocSyncAdapter {
  protected bindDocumentSyncMessageEvents() {
    super.bindDocumentSyncMessageEvents()

    this.messageTransporter.on(MessageType.NOTE_CONTENT_UPDATE, () => {
      this.markAsSynced()
    })
  }
}
