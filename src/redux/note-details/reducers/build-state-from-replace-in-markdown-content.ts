/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDetails } from '../types/note-details'
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'

const replaceAllExists = String.prototype.replaceAll !== undefined

/**
 * A replace-all string function that uses a polyfill if the environment doesn't
 * support replace-all (like node 14 for unit tests).
 * TODO: Remove polyfill when node 14 is removed
 *
 * @param haystack The string that should be modified
 * @param needle The string that should get replaced
 * @param replacement The string that should replace
 * @return The modified string
 */
const replaceAll = (haystack: string, needle: string, replacement: string): string =>
  replaceAllExists ? haystack.replaceAll(needle, replacement) : haystack.split(needle).join(replacement)

/**
 * Builds a {@link NoteDetails} redux state with a modified markdown content.
 *
 * @param state The previous redux state
 * @param replaceable The string that should be replaced in the old markdown content
 * @param replacement The string that should replace the replaceable
 * @return An updated {@link NoteDetails} redux state
 */
export const buildStateFromReplaceInMarkdownContent = (
  state: NoteDetails,
  replaceable: string,
  replacement: string
): NoteDetails => {
  return buildStateFromUpdatedMarkdownContent(state, replaceAll(state.markdownContent.plain, replaceable, replacement))
}
