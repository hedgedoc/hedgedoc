/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from '../message-transporters/message.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'
import { Listener } from 'eventemitter2'

export class YDocSyncClientAdapter extends YDocSyncAdapter {
  protected bindDocumentSyncMessageEvents() {
    const destroyCallback = super.bindDocumentSyncMessageEvents()

    const noteContentUpdateListener = this.messageTransporter.on(
      MessageType.NOTE_CONTENT_UPDATE,
      () => {
        this.markAsSynced()
      },
      { objectify: true },
    ) as Listener

    return () => {
      destroyCallback()
      noteContentUpdateListener.off()
    }
  }
}
