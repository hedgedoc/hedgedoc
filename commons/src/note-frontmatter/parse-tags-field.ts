/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Parses the tags field from the note frontmatter, which should be an array,
 * but for backwards-compatibility we also accept comma-separated strings.
 * Empty tags are dropped from the list and whitespace is trimmed.
 *
 * @param input The input to parse
 * @returns The parsed list of tags or an empty array if the input is invalid
 */
export const parseTagsField = (input: unknown): string[] => {
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => !!tag)
  }
  if (Array.isArray(input)) {
    return input.map((tag) => tag.toString().trim()).filter((tag) => !!tag)
  }
  return []
}
