/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type FrontmatterExtractionResult = PresentFrontmatterExtractionResult | NonPresentFrontmatterExtractionResult

export interface PresentFrontmatterExtractionResult {
  isPresent: true
  rawText: string
  lineOffset: number
}

interface NonPresentFrontmatterExtractionResult {
  isPresent: false
}
