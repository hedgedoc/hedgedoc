/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CodeBlockComponentReplacer } from '../../replace-components/code-block-component-replacer'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { SequenceDiagram } from './sequence-diagram'
import { CodeBlockMarkdownExtension } from '../code-block-markdown-extension/code-block-markdown-extension'
import type { Linter } from '../../../editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../editor-page/editor-pane/linter/single-line-regex-linter'
import { t } from 'i18next'

/**
 * Adds legacy support for sequence diagram to the markdown rendering using code fences with "sequence" as language.
 */
export class SequenceDiagramMarkdownExtension extends CodeBlockMarkdownExtension {
  public buildReplacers(): ComponentReplacer[] {
    return [new CodeBlockComponentReplacer(SequenceDiagram, 'sequence')]
  }

  public buildLinter(): Linter[] {
    return [new SingleLineRegexLinter(/```sequence/, t('editor.linter.sequence'), () => '```mermaid\nsequenceDiagram')]
  }
}
