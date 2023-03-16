/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Message,
  MessageTransporter,
  MessageType,
  YDocSync,
} from '@hedgedoc/commons';

import { RealtimeNote } from './realtime-note';

export class YDocSyncAdapter extends YDocSync {
  protected afterConnect(): void {
    this.markAsSynced();
  }

  constructor(
    private readonly realtimeNote: RealtimeNote,
    readonly messageTransporter: MessageTransporter,
  ) {
    super(realtimeNote.getDoc(), messageTransporter);

    const callback = this.processDocUpdate.bind(this, realtimeNote);

    realtimeNote.getDoc().on('update', callback);
    this.messageTransporter.on('disconnected', () => {
      realtimeNote.getDoc().off('update', callback);
    });
  }

  private processDocUpdate(
    realtimeNote: RealtimeNote,
    update: Uint8Array,
    origin: unknown,
  ): void {
    const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
      type: MessageType.NOTE_CONTENT_UPDATE,
      payload: Array.from(update),
    };

    realtimeNote.getConnections().forEach((client) => {
      if (client.getSyncAdapter().isSynced() && origin !== client) {
        client.getTransporter().sendMessage(message);
      }
    });
  }
}
