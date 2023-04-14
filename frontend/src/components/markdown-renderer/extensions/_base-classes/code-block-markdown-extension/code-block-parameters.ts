/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const codeFenceArguments = /^ *([\w-]*)(.*)$/

interface CodeBlockParameters {
  language: string
  codeFenceParameters: string
}

/**
 * Parses the language name and additional parameters from a code block name input.
 *
 * @param text The text to parse
 * @return The parsed parameters
 */
export const parseCodeBlockParameters = (text: string): CodeBlockParameters => {
  const parsedText = codeFenceArguments.exec(text)
  return {
    language: parsedText?.[1].trim() ?? '',
    codeFenceParameters: parsedText?.[2].trim() ?? ''
  }
}
