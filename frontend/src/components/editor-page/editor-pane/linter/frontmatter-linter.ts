/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RawNoteFrontmatter } from '../../../../redux/note-details/raw-note-frontmatter-parser/types'
import type { Linter } from './linter'
import type { Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'
import { extractFrontmatter } from '@hedgedoc/commons'
import { t } from 'i18next'
import { load } from 'js-yaml'

/**
 * Creates a {@link Linter linter} for the yaml frontmatter.
 *
 * It checks that the yaml is valid and that the tags are not using the deprecated comma-seperated list syntax.
 */
export class FrontmatterLinter implements Linter {
  lint(view: EditorView): Diagnostic[] {
    const lines = view.state.doc.toString().split('\n')
    const frontmatterExtraction = extractFrontmatter(lines)
    if (frontmatterExtraction === undefined) {
      return []
    }
    const startOfYaml = lines[0].length + 1
    const frontmatterLines = lines.slice(1, frontmatterExtraction.lineOffset - 1)
    const rawNoteFrontmatter = FrontmatterLinter.loadYaml(frontmatterExtraction.rawText)
    if (rawNoteFrontmatter === undefined) {
      return [
        {
          from: startOfYaml,
          to: startOfYaml + frontmatterLines.join('\n').length,
          message: t('editor.linter.frontmatter'),
          severity: 'error'
        }
      ]
    }
    if (typeof rawNoteFrontmatter.tags !== 'string' && typeof rawNoteFrontmatter.tags !== 'number') {
      return []
    }
    const tags: string[] =
      rawNoteFrontmatter?.tags
        .toString()
        .split(',')
        .map((entry) => entry.trim()) ?? []
    const replacedText = 'tags:\n- ' + tags.join('\n- ')
    const tagsLineIndex = frontmatterLines.findIndex((value) => value.startsWith('tags: '))
    const linesBeforeTagsLine = frontmatterLines.slice(0, tagsLineIndex)
    const from = startOfYaml + linesBeforeTagsLine.join('\n').length + 1
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

  private static loadYaml(raw: string): RawNoteFrontmatter | undefined {
    try {
      return load(raw) as RawNoteFrontmatter
    } catch {
      return undefined
    }
  }
}
