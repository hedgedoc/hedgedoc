/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/message-transporter.js'
import { YDocSyncAdapter } from './y-doc-sync-adapter.js'

export class YDocSyncServerAdapter extends YDocSyncAdapter {
  constructor(readonly messageTransporter: MessageTransporter) {
    super(messageTransporter)
    this.markAsSynced()
  }
}
