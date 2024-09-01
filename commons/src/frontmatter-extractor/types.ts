/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface FrontmatterExtractionResult {
  rawText: string
  lineOffset: number
  incomplete: boolean
}
