/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type MarkdownIt from 'markdown-it/lib'
import type StateCore from 'markdown-it/lib/rules_core/state_core'
import Token from 'markdown-it/lib/token'

/**
 * This functions adds a 'section close' token at currentTokenIndex in the state's token array,
 * replacing the current token, if replaceCurrentToken is true.
 * It also returns the currentTokenIndex, that will be increased only if the previous token was not replaced.
 *
 * @param {number} currentTokenIndex - the current position in the tokens array
 * @param {StateCore} state - the state core
 * @param {boolean} replaceCurrentToken  - if the currentToken should be replaced
 */
const addSectionClose = (currentTokenIndex: number, state: StateCore, replaceCurrentToken: boolean): void => {
  const sectionCloseToken = new Token('section', 'section', -1)
  state.tokens.splice(currentTokenIndex, replaceCurrentToken ? 1 : 0, sectionCloseToken)
}

/**
 * This functions adds a 'section open' token at insertIndex in the state's token array.
 *
 * @param {number} insertIndex - the index at which the token should be added
 * @param {StateCore} state - the state core
 */
const addSectionOpen = (insertIndex: number, state: StateCore): void => {
  const sectionOpenToken = new Token('section', 'section', 1)
  state.tokens.splice(insertIndex, 0, sectionOpenToken)
}

/**
 * Adds a plugin to the given {@link MarkdownIt markdown it instance} that
 * replaces splits the content by horizontal lines and groups these blocks into
 * html section tags.
 *
 * @param markdownIt The {@link MarkdownIt markdown it instance} to which the plugin should be added
 */
export const addSlideSectionsMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt): void => {
  markdownIt.core.ruler.push('reveal.sections', (state) => {
    let sectionBeginIndex = 0
    let lastSectionWasBranch = false

    for (let currentTokenIndex = 0; currentTokenIndex < state.tokens.length; currentTokenIndex++) {
      const currentToken = state.tokens[currentTokenIndex]

      if (currentToken.type !== 'hr') {
        continue
      }

      addSectionOpen(sectionBeginIndex, state)
      currentTokenIndex += 1

      if (currentToken.markup === '---' && lastSectionWasBranch) {
        lastSectionWasBranch = false
        addSectionClose(currentTokenIndex, state, false)
        currentTokenIndex += 1
      } else if (currentToken.markup === '----' && !lastSectionWasBranch) {
        lastSectionWasBranch = true
        addSectionOpen(sectionBeginIndex, state)
        currentTokenIndex += 1
      }

      addSectionClose(currentTokenIndex, state, true)
      sectionBeginIndex = currentTokenIndex + 1
    }

    addSectionOpen(sectionBeginIndex, state)
    addSectionClose(state.tokens.length, state, false)
    if (lastSectionWasBranch) {
      addSectionClose(state.tokens.length, state, false)
    }
    return true
  })
}
