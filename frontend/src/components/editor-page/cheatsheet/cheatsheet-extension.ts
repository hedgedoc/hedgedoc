/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type React from 'react'

export interface CheatsheetExtensionComponentProps {
  setContent: (dispatcher: string | ((prevState: string) => string)) => void
}

export type CheatsheetExtension = CheatsheetEntry | CheatsheetGroup

export const isCheatsheetGroup = (extension: CheatsheetExtension | undefined): extension is CheatsheetGroup => {
  return (extension as CheatsheetGroup)?.entries !== undefined
}

export interface CheatsheetGroup {
  i18nKey: string
  categoryI18nKey?: string
  entries: CheatsheetEntry[]
}

export interface CheatsheetEntry {
  i18nKey: string
  categoryI18nKey?: string
  cheatsheetExtensionComponent?: React.FC<CheatsheetExtensionComponentProps>

  readMoreUrl?: URL
}
