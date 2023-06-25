/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from './linter'
import type { Action, Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'
import { t } from 'i18next'

interface LineWithStartIndex {
  line: string
  startIndex: number
}

/**
 * Creates a {@link Linter linter} from {@link RegExp regexp} for single lines.
 *
 * @param regex The {@link RegExp regexp} to execute on each line
 * @param message The message to display if the {@link RegExp regexp} hits
 * @param replace The function to replace what was found by {@link RegExp regexp}
 * @param actionLabel The optional label to translate and use as the fix button for the linter.
 */
export class SingleLineRegexLinter implements Linter {
  constructor(
    private regex: RegExp,
    private message: string,
    private replace?: (match: string) => string,
    private actionLabel?: string
  ) {}

  lint(view: EditorView): Diagnostic[] {
    const lines = view.state.doc.toString().split('\n')
    return lines
      .reduce((state, line, lineIndex, lines) => {
        state[lineIndex] = {
          line,
          startIndex: lineIndex === 0 ? 0 : state[lineIndex - 1].startIndex + lines[lineIndex - 1].length + 1
        } as LineWithStartIndex
        return state
      }, new Array<LineWithStartIndex>(lines.length))
      .map(({ line, startIndex }) => ({
        lineStartIndex: startIndex,
        regexResult: this.regex.exec(line)
      }))
      .filter(({ regexResult }) => regexResult !== null && regexResult.length !== 0)
      .map(({ lineStartIndex, regexResult }) => this.createDiagnostic(lineStartIndex, regexResult as RegExpExecArray))
  }

  private buildActions(found: RegExpExecArray): Action[] {
    if (this.replace === undefined) {
      return []
    }
    const replacedText = this.replace(found[1])
    return [
      {
        name: t(this.actionLabel ?? 'editor.linter.defaultAction'),
        apply: (view: EditorView, from: number, to: number) => {
          view.dispatch({
            changes: { from, to, insert: replacedText }
          })
        }
      }
    ]
  }

  private createDiagnostic(from: number, found: RegExpExecArray): Diagnostic {
    return {
      from: from,
      to: from + found[0].length,
      actions: this.buildActions(found),
      message: this.message,
      severity: 'warning'
    }
  }
}
