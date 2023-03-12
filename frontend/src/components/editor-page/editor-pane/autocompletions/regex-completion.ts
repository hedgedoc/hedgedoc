/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'

/**
 * Returns a {@link CompletionSource} for a regex-matching autocompletion.
 *
 * @param regexToMatch The regex to match in front of the cursor
 * @param options The options to return
 * @return A function to test and perform the configured completions.
 */
export const regexCompletion =
  (regexToMatch: RegExp, options: Completion[]) =>
  (context: CompletionContext): CompletionResult | null => {
    const match = context.matchBefore(regexToMatch)
    if (!match || (match.from === match.to && !context.explicit)) {
      return null
    }
    return {
      from: match.from,
      options
    }
  }
