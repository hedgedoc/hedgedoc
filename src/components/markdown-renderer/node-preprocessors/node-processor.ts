/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Document } from 'domhandler'

export abstract class NodeProcessor {
  public abstract process(nodes: Document): Document
}
