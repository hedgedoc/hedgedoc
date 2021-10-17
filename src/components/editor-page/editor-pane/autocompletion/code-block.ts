/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, Hint, Hints } from 'codemirror'
import { Pos } from 'codemirror'
import type { Hinter } from './index'
import { findWordAtCursor, generateHintListByPrefix } from './index'
import { showErrorNotification } from '../../../../redux/ui-notifications/methods'
import { Logger } from '../../../../utils/logger'

type highlightJsImport = typeof import('../../../common/hljs/hljs')

const log = new Logger('Autocompletion > CodeBlock')
const wordRegExp = /^```((?:\w|-|\+)*)$/
let allSupportedLanguages: string[] = []

/**
 * Fetches the highlight js chunk.
 * @return the retrieved highlight js api
 */
const loadHighlightJs = async (): Promise<highlightJsImport | null> => {
  try {
    return await import('../../../common/hljs/hljs')
  } catch (error) {
    showErrorNotification('common.errorWhileLoadingLibrary', { name: 'highlight.js' })(error as Error)
    log.error('Error while loading highlight.js', error)
    return null
  }
}

/**
 * Extracts the language from the current line in the editor.
 *
 * @param editor The editor that contains the search time
 * @return null if no search term could be found or the found word and the cursor position.
 */
const extractSearchTerm = (
  editor: Editor
): null | {
  searchTerm: string
  startIndex: number
  endIndex: number
} => {
  const searchTerm = findWordAtCursor(editor)
  const searchResult = wordRegExp.exec(searchTerm.text)
  if (searchResult === null) {
    return null
  }

  return {
    searchTerm: searchResult[1],
    startIndex: searchTerm.start,
    endIndex: searchTerm.end
  }
}

/**
 * Builds the list of languages that are supported by highlight js or custom embeddings.
 * @return An array of language names
 */
const buildLanguageList = async (): Promise<string[]> => {
  const highlightJs = await loadHighlightJs()

  if (highlightJs === null) {
    return []
  }

  if (allSupportedLanguages.length === 0) {
    allSupportedLanguages = highlightJs.default
      .listLanguages()
      .concat('csv', 'flow', 'html', 'js', 'markmap', 'abc', 'graphviz', 'mermaid', 'vega-lite')
  }

  return allSupportedLanguages
}

/**
 * Creates a codemirror autocompletion hint with supported highlight js languages.
 *
 * @param editor The codemirror editor that requested the autocompletion
 * @return The generated {@link Hints} or null if no hints exist.
 */
const codeBlockHint = async (editor: Editor): Promise<Hints | null> => {
  const searchResult = extractSearchTerm(editor)
  if (!searchResult) {
    return null
  }

  const languages = await buildLanguageList()
  if (languages.length === 0) {
    return null
  }
  const suggestions = generateHintListByPrefix(searchResult.searchTerm, languages)
  if (!suggestions) {
    return null
  }
  const lineIndex = editor.getCursor().line
  return {
    list: suggestions.map(
      (suggestion: string): Hint => ({
        text: '```' + suggestion + '\n\n```\n',
        displayText: suggestion
      })
    ),
    from: Pos(lineIndex, searchResult.startIndex),
    to: Pos(lineIndex, searchResult.endIndex)
  }
}

export const CodeBlockHinter: Hinter = {
  wordRegExp,
  hint: codeBlockHint
}
