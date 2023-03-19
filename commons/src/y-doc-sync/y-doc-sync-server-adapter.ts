/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/message-transporter.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'
import { Doc } from 'yjs'

export class YDocSyncServerAdapter extends YDocSyncAdapter {
  constructor(
    readonly doc: Doc,
    readonly messageTransporter: MessageTransporter
  ) {
    super(doc, messageTransporter)
    this.markAsSynced()
  }
}
