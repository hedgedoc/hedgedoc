/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react'

interface LanguageOptionProps {
  languageCode: string
}

/**
 * Displays a select option for a language. The display name is determined using the browser API.
 *
 * @param languageCode the language code to display
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 */
export const LanguageOption: React.FC<LanguageOptionProps> = ({ languageCode }) => {
  const displayName = useMemo(
    () => new Intl.DisplayNames([languageCode], { type: 'language' }).of(languageCode) ?? null,
    [languageCode]
  )

  return <option value={languageCode}>{displayName}</option>
}
