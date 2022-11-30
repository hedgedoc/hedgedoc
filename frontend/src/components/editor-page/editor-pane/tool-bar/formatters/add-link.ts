/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from './types/changes'
import type { CursorSelection } from './types/cursor-selection'

const beforeDescription = '['
const afterDescriptionBeforeLink = ']('
const defaultUrl = 'https://'
const afterLink = ')'

/**
 * Creates a copy of the given markdown content lines but inserts a new link tag.
 *
 * @param markdownContent The content of the document to modify
 * @param selection If the selection has no to-cursor then the tag will be inserted at this position.
 *                  If the selection has a to-cursor then the selected text will be inserted into the description or the URL part.
 * @param prefix An optional prefix for the link
 * @return the modified copy of lines
 */
export const addLink = (
  markdownContent: string,
  selection: CursorSelection,
  prefix = ''
): [ContentEdits, CursorSelection] => {
  const from = selection.from
  const to = selection.to ?? from
  const selectedText = markdownContent.slice(from, to)
  const link = buildLink(selectedText, prefix)
  const changes: ContentEdits = [
    {
      from: from,
      to: to,
      insert: link
    }
  ]
  return [changes, { from, to: from + link.length }]
}

const buildLink = (selectedText: string, prefix: string): string => {
  const linkRegex = /^(?:https?|mailto):/
  if (linkRegex.test(selectedText)) {
    return prefix + beforeDescription + afterDescriptionBeforeLink + selectedText + afterLink
  } else {
    return prefix + beforeDescription + selectedText + afterDescriptionBeforeLink + defaultUrl + afterLink
  }
}
