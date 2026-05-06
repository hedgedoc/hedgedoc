/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { SingleLineRegexLinter } from './single-line-regex-linter'
import type { Diagnostic } from '@codemirror/lint'
import { mockEditorView } from './mock-editor-view'

/**
 * Expects that the linter returns the expected diagnostics for the given regex and content.
 * @param regex The regex that should be used to find the expected diagnostics
 * @param replace The function that should be used to replace the matched text
 * @param content The content that should be used to find the expected diagnostics
 * @param expectedDiagnostics Array of expected diagnostics that should be returned by the linter
 */
const expectSingleLineRegexLinterResult = (
  regex: RegExp,
  replace: (match: string) => string,
  content: string,
  expectedDiagnostics: Partial<Diagnostic>[]
): void => {
  const testMessage = 'message'
  const testActionLabel = 'actionLabel'
  const singleLineRegexLinter = new SingleLineRegexLinter(regex, testMessage, replace, testActionLabel)
  const editorView = mockEditorView(content)
  const calculatedDiagnostics = singleLineRegexLinter.lint(editorView)
  expect(calculatedDiagnostics).toHaveLength(expectedDiagnostics.length)
  calculatedDiagnostics.forEach((calculatedDiagnostic, index) => {
    expect(calculatedDiagnostic.from).toEqual(expectedDiagnostics[index].from)
    expect(calculatedDiagnostic.to).toEqual(expectedDiagnostics[index].to)
    expect(calculatedDiagnostic.message).toEqual(testMessage)
    expect(calculatedDiagnostic.severity).toEqual('warning')
    expect(calculatedDiagnostic.actions).toHaveLength(1)
    expect(calculatedDiagnostic.actions?.[0].name).toEqual(testActionLabel)
  })
}

describe('SingleLineRegexLinter', () => {
  beforeAll(async () => {
    await mockI18n()
  })
  it('works for a simple regex', () => {
    expectSingleLineRegexLinterResult(/^foo$/, () => 'bar', 'This\nis\na\ntest\nfoo\nbar\n123', [
      {
        from: 15,
        to: 18
      }
    ])
  })
  it('works for a multiple hits', () => {
    expectSingleLineRegexLinterResult(/^foo$/, () => 'bar', 'This\nfoo\na\ntest\nfoo\nbar\n123', [
      {
        from: 5,
        to: 8
      },
      {
        from: 16,
        to: 19
      }
    ])
  })
  it('work if there are no hits', () => {
    expectSingleLineRegexLinterResult(/^nothing$/, () => 'bar', 'This\nfoo\na\ntest\nfoo\nbar\n123', [])
  })
})
