/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from './linter'
import type { Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'
import { extractFrontmatter, parseRawFrontmatterFromYaml, parseTags } from '@hedgedoc/commons'
import { t } from 'i18next'

/**
 * Creates a {@link Linter linter} for the yaml frontmatter.
 *
 * It checks that the yaml is valid and that the tags are not using the deprecated comma-seperated list syntax.
 */
export class FrontmatterLinter implements Linter {
  lint(view: EditorView): Diagnostic[] {
    const lines = view.state.doc.toString().split('\n')
    const frontmatterExtraction = extractFrontmatter(lines)
    if (frontmatterExtraction === undefined || frontmatterExtraction.incomplete) {
      return []
    }
    const frontmatterLines = lines.slice(1, frontmatterExtraction.lineOffset - 1)
    const startOfYaml = lines[0].length + 1
    const endOfYaml = startOfYaml + frontmatterLines.join('\n').length
    const rawNoteFrontmatter = parseRawFrontmatterFromYaml(frontmatterExtraction.rawText)
    if (rawNoteFrontmatter.error) {
      return this.createErrorDiagnostics(startOfYaml, endOfYaml, rawNoteFrontmatter.error, 'error')
    } else if (rawNoteFrontmatter.warning) {
      return this.createErrorDiagnostics(startOfYaml, endOfYaml, rawNoteFrontmatter.warning, 'warning')
    } else if (!Array.isArray(rawNoteFrontmatter.value.tags)) {
      return this.createReplaceSingleStringTagsDiagnostic(rawNoteFrontmatter.value.tags, frontmatterLines, startOfYaml)
    }
    return []
  }

  private createErrorDiagnostics(
    startOfYaml: number,
    endOfYaml: number,
    error: Error,
    severity: 'error' | 'warning'
  ): Diagnostic[] {
    return [
      {
        from: startOfYaml,
        to: endOfYaml,
        message: error.message,
        severity: severity
      }
    ]
  }

  private createReplaceSingleStringTagsDiagnostic(
    rawTags: string,
    frontmatterLines: string[],
    startOfYaml: number
  ): Diagnostic[] {
    const tags: string[] = parseTags(rawTags)
    const replacedText = 'tags:\n- ' + tags.join('\n- ')
    const tagsLineIndex = frontmatterLines.findIndex((value) => value.startsWith('tags: '))
    const linesBeforeTagsLine = frontmatterLines.slice(0, tagsLineIndex)
    const from = startOfYaml + linesBeforeTagsLine.join('\n').length + linesBeforeTagsLine.length
    const to = from + frontmatterLines[tagsLineIndex].length
    return [
      {
        from: from,
        to: to,
        actions: [
          {
            name: t('editor.linter.defaultAction'),
            apply: (view: EditorView, from: number, to: number) => {
              view.dispatch({
                changes: { from, to, insert: replacedText }
              })
            }
          }
        ],
        message: t('editor.linter.frontmatter-tags'),
        severity: 'warning'
      }
    ]
  }
}
