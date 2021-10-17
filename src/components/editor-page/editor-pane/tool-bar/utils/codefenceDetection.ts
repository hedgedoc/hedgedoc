/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor } from 'codemirror'

export const isCursorInCodefence = (editor: Editor): boolean => {
  const currentLine = editor.getCursor().line
  let codefenceCount = 0
  for (let line = currentLine; line >= 0; --line) {
    const markdownContentLine = editor.getDoc().getLine(line)
    if (markdownContentLine.startsWith('```')) {
      codefenceCount++
    }
  }
  return codefenceCount % 2 === 1
}
