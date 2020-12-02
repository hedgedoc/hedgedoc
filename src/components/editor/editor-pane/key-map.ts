/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import CodeMirror, { Editor, KeyMap, Pass } from 'codemirror'
import { isMac } from '../utils'
import {
  makeSelectionBold,
  makeSelectionItalic,
  markSelection,
  strikeThroughSelection,
  underlineSelection
} from './tool-bar/utils/toolbarButtonUtils'

const isVim = (keyMapName?: string) => (keyMapName?.substr(0, 3) === 'vim')

const f10 = (editor: Editor): void | typeof Pass => editor.setOption('fullScreen', !editor.getOption('fullScreen'))
const esc = (editor: Editor): void | typeof Pass => {
  if (editor.getOption('fullScreen') && !isVim(editor.getOption('keyMap'))) {
    editor.setOption('fullScreen', false)
  } else {
    return CodeMirror.Pass
  }
}
const suppressKey = (): undefined => undefined
const tab = (editor: Editor) => {
  const tab = '\t'

  // contruct x length spaces
  const spaces = Array((editor.getOption('indentUnit') ?? 0) + 1).join(' ')

  // auto indent whole line when in list or blockquote
  const cursor = editor.getCursor()
  const line = editor.getLine(cursor.line)

  // this regex match the following patterns
  // 1. blockquote starts with "> " or ">>"
  // 2. unorder list starts with *+-parseInt
  // 3. order list starts with "1." or "1)"
  const regex = /^(\s*)(>[> ]*|[*+-]\s|(\d+)([.)]))/

  let match
  const multiple = editor.getSelection().split('\n').length > 1 ||
    editor.getSelections().length > 1

  if (multiple) {
    editor.execCommand('defaultTab')
  } else if ((match = regex.exec(line)) !== null) {
    const ch = match[1].length
    const pos = {
      line: cursor.line,
      ch: ch
    }
    if (editor.getOption('indentWithTabs')) {
      editor.replaceRange(tab, pos, pos, '+input')
    } else {
      editor.replaceRange(spaces, pos, pos, '+input')
    }
  } else {
    if (editor.getOption('indentWithTabs')) {
      editor.execCommand('defaultTab')
    } else {
      editor.replaceSelection(spaces)
    }
  }
}

export const defaultKeyMap: KeyMap = !isMac
  ? {
      F9: suppressKey,
      F10: f10,
      Esc: esc,
      'Ctrl-S': suppressKey,
      Enter: 'newlineAndIndentContinueMarkdownList',
      Tab: tab,
      Home: 'goLineLeftSmart',
      End: 'goLineRight',
      'Ctrl-I': makeSelectionItalic,
      'Ctrl-B': makeSelectionBold,
      'Ctrl-U': underlineSelection,
      'Ctrl-D': strikeThroughSelection,
      'Ctrl-M': markSelection
    }
  : {
      F9: suppressKey,
      F10: f10,
      Esc: esc,
      'Cmd-S': suppressKey,
      Enter: 'newlineAndIndentContinueMarkdownList',
      Tab: tab,
      'Cmd-Left': 'goLineLeftSmart',
      'Cmd-Right': 'goLineRight',
      Home: 'goLineLeftSmart',
      End: 'goLineRight',
      'Cmd-I': makeSelectionItalic,
      'Cmd-B': makeSelectionBold,
      'Cmd-U': underlineSelection,
      'Cmd-D': strikeThroughSelection,
      'Cmd-M': markSelection
    }
