/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface QuoteExtraTagValues {
  labelStartIndex: number
  labelEndIndex: number
  valueStartIndex: number
  valueEndIndex: number
  label: string
  value: string
}

/**
 * Parses a blockquote tag. The syntax is [label=value].
 *
 * @param line The line in which the tag should be looked for.
 * @param startIndex The start index for the search.
 * @param dontSearchAfterIndex The maximal position for the search.
 */
export const parseBlockquoteExtraTag = (
  line: string,
  startIndex: number,
  dontSearchAfterIndex: number
): QuoteExtraTagValues | undefined => {
  if (line[startIndex] !== '[') {
    return
  }

  const labelStartIndex = startIndex + 1
  const labelEndIndex = parseLabel(line, labelStartIndex, dontSearchAfterIndex)
  if (!labelEndIndex || labelStartIndex === labelEndIndex) {
    return
  }

  const valueStartIndex = labelEndIndex + 1
  const valueEndIndex = parseValue(line, valueStartIndex, dontSearchAfterIndex)
  if (!valueEndIndex || valueStartIndex === valueEndIndex) {
    return
  }

  return {
    labelStartIndex,
    labelEndIndex,
    valueStartIndex,
    valueEndIndex,
    label: line.slice(labelStartIndex, labelEndIndex),
    value: line.slice(valueStartIndex, valueEndIndex)
  }
}

/**
 * Parses the value part of a blockquote tag. That is [notthis=THIS] part. It also detects nested [] blocks.
 *
 * @param line The line in which the tag is.
 * @param startIndex The start index of the tag.
 * @param dontSearchAfterIndex The maximal position for the search.
 */
const parseValue = (line: string, startIndex: number, dontSearchAfterIndex: number): number | undefined => {
  let level = 0
  for (let position = startIndex; position <= dontSearchAfterIndex; position += 1) {
    const currentCharacter = line[position]
    if (currentCharacter === ']') {
      if (level === 0) {
        return position
      }
      level -= 1
    } else if (currentCharacter === '[') {
      level += 1
    }
  }
}

/**
 * Parses the label part of a blockquote tag. That is [THIS=notthis] part.
 *
 * @param line The line in which the tag is.
 * @param startIndex The start index of the tag.
 * @param dontSearchAfterIndex The maximal position for the search.
 */
const parseLabel = (line: string, startIndex: number, dontSearchAfterIndex: number): number | undefined => {
  for (let pos = startIndex; pos <= dontSearchAfterIndex; pos += 1) {
    if (line[pos] === '=') {
      return pos
    }
  }
}
