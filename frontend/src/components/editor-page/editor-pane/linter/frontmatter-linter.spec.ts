/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { FrontmatterLinter } from './frontmatter-linter'
import { mockEditorView } from './single-line-regex-linter.spec'
import type { Diagnostic } from '@codemirror/lint'
import { t } from 'i18next'

const testFrontmatterLinter = (
  editorContent: string,
  expectedDiagnostics: Partial<Diagnostic>,
  expectedReplacement?: string
): void => {
  const frontmatterLinter = new FrontmatterLinter()
  const editorView = mockEditorView(editorContent)
  const calculatedDiagnostics = frontmatterLinter.lint(editorView)
  expect(calculatedDiagnostics).toHaveLength(1)
  expect(calculatedDiagnostics[0].from).toEqual(expectedDiagnostics.from)
  expect(calculatedDiagnostics[0].to).toEqual(expectedDiagnostics.to)
  expect(calculatedDiagnostics[0].severity).toEqual(expectedDiagnostics.severity)
  if (expectedReplacement !== undefined) {
    const spy = jest.spyOn(editorView, 'dispatch')
    expect(calculatedDiagnostics[0].actions).toHaveLength(1)
    expect(calculatedDiagnostics[0].actions?.[0].name).toEqual(t('editor.linter.defaultAction'))
    calculatedDiagnostics[0].actions?.[0].apply(editorView, calculatedDiagnostics[0].from, calculatedDiagnostics[0].to)
    expect(spy).toHaveBeenCalledWith({
      changes: {
        from: calculatedDiagnostics[0].from,
        to: calculatedDiagnostics[0].to,
        insert: expectedReplacement
      }
    })
  }
}

describe('FrontmatterLinter', () => {
  beforeAll(async () => {
    await mockI18n()
  })
  describe('with invalid tags', () => {
    it('(one)', () => {
      testFrontmatterLinter(
        '---\ntags: a\n---',
        {
          from: 4,
          to: 11,
          severity: 'warning'
        },
        'tags:\n- a'
      )
    })
    it('(one, but a number)', () => {
      testFrontmatterLinter(
        '---\ntags: 1\n---',
        {
          from: 4,
          to: 11,
          severity: 'warning'
        },
        'tags:\n- 1'
      )
    })
    it('(multiple)', () => {
      testFrontmatterLinter(
        '---\ntags: 123, a\n---',
        {
          from: 4,
          to: 16,
          severity: 'warning'
        },
        'tags:\n- 123\n- a'
      )
    })
  })
  it('with invalid yaml', () => {
    testFrontmatterLinter('---\n1\n  2: 3\n---', {
      from: 4,
      to: 12,
      severity: 'error'
    })
  })
})
