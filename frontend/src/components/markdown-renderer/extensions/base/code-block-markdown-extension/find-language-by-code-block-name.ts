/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parseCodeBlockParameters } from './code-block-parameters'
import type { LanguageDescription } from '@codemirror/language'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Finds the {@link LanguageDescription code mirror language descriptions} that matches the given language name or any alias.
 * It ignores additional code block name parameters.
 *
 * @param languages The languages in which the description should be found
 * @param inputLanguageName The input from the code block
 * @return The found language description or null if no language could be found by name or alias
 */
export const findLanguageByCodeBlockName = (
  languages: LanguageDescription[],
  inputLanguageName: string
): LanguageDescription | null => {
  return Optional.ofNullable(parseCodeBlockParameters(inputLanguageName).language)
    .map((filteredLanguage) =>
      languages.find((language) => language.name === filteredLanguage || language.alias.includes(filteredLanguage))
    )
    .orElse(null)
}
