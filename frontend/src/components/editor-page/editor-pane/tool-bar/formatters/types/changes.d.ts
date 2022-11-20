/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface ContentEdit {
  from: number
  to: number
  insert: string
}

export type ContentEdits = ContentEdit[]
