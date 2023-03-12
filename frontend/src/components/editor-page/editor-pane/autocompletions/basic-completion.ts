/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { regexCompletion } from './regex-completion'
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'

export const codeFenceRegex = /(?:^|\s)`(?:`|``|``\w+)?$/

/**
 * Returns a {@link CompletionSource} for a regex-matching autocompletion with a single completion entry.
 *
 * @param regexToMatch The regex to match in front of the cursor
 * @param replace The string to insert as completion
 * @param description An optional description to show besides the suggestion
 * @return A function to test and perform the configured completion.
 */
export const basicCompletion = (
  regexToMatch: RegExp,
  replace: string,
  description?: string
): ((_: CompletionContext) => CompletionResult | null) => {
  return regexCompletion(regexToMatch, [{ label: replace, detail: description }])
}
