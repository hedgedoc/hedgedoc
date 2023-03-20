/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Message,
  MessageTransporter,
  MessageType,
  YDocSyncServerAdapter,
} from '@hedgedoc/commons';
import { Doc } from 'yjs';

import { RealtimeNote } from './realtime-note';

/**
 * Synchronizes the document content of a {@link RealtimeNote} with a client.
 */
export class YDocSyncAdapter extends YDocSyncServerAdapter {
  constructor(
    private readonly realtimeNote: RealtimeNote,
    readonly messageTransporter: MessageTransporter,
  ) {
    super(realtimeNote.getDoc(), messageTransporter);
  }

  protected bindDocumentSyncMessageEvents(doc: Doc): void {
    super.bindDocumentSyncMessageEvents(doc);

    const callback = this.processDocUpdate.bind(this);
    doc.on('update', callback);
    this.messageTransporter.on('disconnected', () => {
      doc.off('update', callback);
    });
  }

  private processDocUpdate(update: Uint8Array, origin: unknown): void {
    if (!this.isSynced()) {
      return;
    }
    const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
      type: MessageType.NOTE_CONTENT_UPDATE,
      payload: Array.from(update),
    };

    this.realtimeNote.getConnections().forEach((client) => {
      const syncAdapter = client.getSyncAdapter();
      if (syncAdapter.isSynced() && origin !== syncAdapter) {
        client.getTransporter().sendMessage(message);
      }
    });
  }
}
