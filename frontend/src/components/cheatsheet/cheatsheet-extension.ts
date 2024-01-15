/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type React from 'react'

export interface CheatsheetExtensionComponentProps {
  setContent: (dispatcher: string | ((prevState: string) => string)) => void
}

export type CheatsheetExtension = CheatsheetSingleEntry | CheatsheetMultiEntry

/**
 * Determine if a given {@link CheatsheetExtension} is a {@link CheatsheetSingleEntry} or a {@link CheatsheetMultiEntry}.
 *
 * @param extension The extension in question
 * @return boolean
 */
export const isCheatsheetMultiEntry = (
  extension: CheatsheetExtension | undefined
): extension is CheatsheetMultiEntry => {
  return extension !== undefined && typeof (extension as CheatsheetMultiEntry).topics === 'object'
}

export interface CheatsheetMultiEntry {
  i18nKey: string
  categoryI18nKey: string
  topics: CheatsheetEntry[]
}

export interface CheatsheetSingleEntry extends CheatsheetEntry {
  categoryI18nKey: string
}

/**
 * This is an entry that describes something completely.
 *
 * In the translations you'll find both 'description' containing an explanation and 'example' containing a demonstration in markdown under the i18nKey.
 * If this entry is a topic of some other entry the i18nKey needs to be prefixed with the i18nKey of the other entry.
 *
 * e.g 'basics.basicFormatting'
 */
export interface CheatsheetEntry {
  i18nKey: string
  cheatsheetExtensionComponent?: React.FC<CheatsheetExtensionComponentProps>
  readMoreUrl?: URL
}
