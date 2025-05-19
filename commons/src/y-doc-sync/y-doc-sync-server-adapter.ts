/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/message-transporter.js'
import { RealtimeDoc } from './realtime-doc.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'

export class YDocSyncServerAdapter extends YDocSyncAdapter {
  constructor(
    readonly messageTransporter: MessageTransporter,
    readonly doc: RealtimeDoc,
    private readonly acceptEditsProvider: () => boolean,
  ) {
    super(messageTransporter, doc)
    this.markAsSynced()
  }

  protected applyIncomingUpdatePayload(update: number[]): void {
    if (!this.acceptEditsProvider()) {
      return
    }
    super.applyIncomingUpdatePayload(update)
  }
}
