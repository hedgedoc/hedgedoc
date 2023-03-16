/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YDocSync } from '@hedgedoc/commons'

export class YDocSyncTestServer extends YDocSync {
  protected afterConnect(): void {
    this.markAsSynced()
  }
}
