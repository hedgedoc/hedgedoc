/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type React from 'react'

export interface CheatsheetExtensionComponentProps {
  setContent: (dispatcher: string | ((prevState: string) => string)) => void
}

export type CheatsheetExtension = CheatsheetSingleEntry | CheatsheetEntryWithTopics

/**
 * Determine if a given {@link CheatsheetExtension} is a {@link CheatsheetEntryWithTopics} or just a {@link CheatsheetSingleEntry}.
 *
 * @param extension The extension in question
 * @return boolean
 */
export const hasCheatsheetTopics = (
  extension: CheatsheetExtension | undefined
): extension is CheatsheetEntryWithTopics => {
  return (extension as CheatsheetEntryWithTopics)?.topics !== undefined
}

/**
 * This is an entry with just a name and a bunch of different topics to discuss.
 *
 * e.g 'basics.headlines' with the topics 'hashtag' and 'equal'
 */
export interface CheatsheetEntryWithTopics {
  i18nKey: string
  categoryI18nKey?: string
  topics: CheatsheetSingleEntry[]
}

/**
 * This is an entry that describes something completely.
 *
 * In the translations you'll find both 'description' containing an explanation and 'example' containing a demonstration in markdown under the i18nKey.
 * If this entry is a topic of some other entry the i18nKey needs to be prefixed with the i18nKey of the other entry.
 *
 * e.g 'basics.basicFormatting'
 */
export interface CheatsheetSingleEntry {
  i18nKey: string
  categoryI18nKey?: string
  cheatsheetExtensionComponent?: React.FC<CheatsheetExtensionComponentProps>

  readMoreUrl?: URL
}
