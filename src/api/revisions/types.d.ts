/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface Revision {
  content: string
  timestamp: number
  authors: string[]
}

export interface RevisionListEntry {
  timestamp: number
  length: number
  authors: string[]
}
