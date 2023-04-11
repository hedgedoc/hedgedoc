/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { SingleLineRegexLinter } from './single-line-regex-linter'
import type { Diagnostic } from '@codemirror/lint'
import type { EditorState, Text } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { Mock } from 'ts-mockery'

export const mockEditorView = (content: string): EditorView => {
  const docMock = Mock.of<Text>()
  docMock.toString = () => content
  return Mock.of<EditorView>({
    state: Mock.of<EditorState>({
      doc: docMock
    }),
    dispatch: jest.fn()
  })
}

const testSingleLineRegexLinter = (
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
    testSingleLineRegexLinter(/^foo$/, () => 'bar', 'This\nis\na\ntest\nfoo\nbar\n123', [
      {
        from: 15,
        to: 18
      }
    ])
  })
  it('works for a multiple hits', () => {
    testSingleLineRegexLinter(/^foo$/, () => 'bar', 'This\nfoo\na\ntest\nfoo\nbar\n123', [
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
    testSingleLineRegexLinter(/^nothing$/, () => 'bar', 'This\nfoo\na\ntest\nfoo\nbar\n123', [])
  })
})
