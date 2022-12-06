/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YDocSync } from './y-doc-sync.js'

export class YDocSyncServer extends YDocSync {
  protected afterConnect(): void {
    this.markAsSynced()
  }
}
