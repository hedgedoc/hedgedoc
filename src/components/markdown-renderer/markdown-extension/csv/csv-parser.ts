/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Parses a given text as comma separated values (CSV).
 *
 * @param csvText The raw csv text
 * @param csvColumnDelimiter The delimiter for the columns
 * @return the values splitted by rows and columns
 */
export const parseCsv = (csvText: string, csvColumnDelimiter: string): string[][] => {
  const rows = csvText.split('\n')
  if (!rows || rows.length === 0) {
    return []
  }
  const splitRegex = new RegExp(`${escapeRegexCharacters(csvColumnDelimiter)}(?=(?:[^"]*"[^"]*")*[^"]*$)`)
  return rows.filter((row) => row !== '').map((row) => row.split(splitRegex))
}

/**
 * Escapes regex characters in the given string, so it can be used as literal string in another regex.
 *
 * @param unsafe The unescaped string
 * @return The escaped string
 */
const escapeRegexCharacters = (unsafe: string): string => {
  return unsafe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
