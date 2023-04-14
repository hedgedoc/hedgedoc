/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Linter } from '../../../components/editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../components/editor-page/editor-pane/linter/single-line-regex-linter'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { LegacySequenceDiagramMarkdownExtension } from './legacy-sequence-diagram-markdown-extension'
import { t } from 'i18next'

/**
 * Adds legacy support for sequence diagram syntax to the markdown renderer.
 */
export class LegacySequenceDiagramAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new LegacySequenceDiagramMarkdownExtension()]
  }

  buildCodeMirrorLinter(): Linter[] {
    return [new SingleLineRegexLinter(/```sequence/, t('editor.linter.sequence'), () => '```mermaid\nsequenceDiagram')]
  }
}
