/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from './linter'
import type { EditorView } from '@codemirror/view'
import type { Diagnostic } from '@codemirror/lint'
import { extractFrontmatter } from '../../../../redux/note-details/frontmatter-extractor/extractor'
import { load } from 'js-yaml'
import type { RawNoteFrontmatter } from '../../../../redux/note-details/raw-note-frontmatter-parser/types'
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
    if (!frontmatterExtraction.isPresent) {
      return []
    }
    const frontmatterLines = lines.slice(0, frontmatterExtraction.lineOffset + 1)
    const rawNoteFrontmatter = FrontmatterLinter.loadYaml(frontmatterExtraction.rawText)
    if (rawNoteFrontmatter === undefined) {
      return [
        {
          from: 0,
          to: frontmatterLines.join('\n').length,
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
    const from = linesBeforeTagsLine.join('\n').length + 1
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
