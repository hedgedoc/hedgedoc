/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Document } from 'domhandler'

/**
 * Base class for node processors.
 */
export abstract class NodeProcessor {
  public abstract process(document: Document): Document
}
