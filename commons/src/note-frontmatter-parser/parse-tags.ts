/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Parses the given value as tags array.
 *
 * @param rawTags The raw value to parse
 * @return the parsed tags
 */
export const parseTags = (rawTags: string | string[]): string[] => {
  return (Array.isArray(rawTags) ? rawTags : rawTags.split(','))
    .map((entry) => entry.trim())
    .filter((tag) => !!tag)
}
