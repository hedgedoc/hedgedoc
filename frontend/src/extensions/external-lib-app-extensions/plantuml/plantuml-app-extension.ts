/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import {
  basicCompletion,
  codeFenceRegex
} from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { MarkdownRendererExtensionOptions } from '../../_base-classes/app-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { PlantumlMarkdownExtension } from './plantuml-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'

/**
 * Adds support for chart rendering using plantuml to the markdown renderer.
 *
 * @see https://plantuml.com
 */
export class PlantumlAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(options: MarkdownRendererExtensionOptions): MarkdownRendererExtension[] {
    return [new PlantumlMarkdownExtension(options.frontendConfig.plantUmlServer)]
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'plantuml', categoryI18nKey: 'charts', readMoreUrl: new URL('https://plantuml.com/') }]
  }

  buildAutocompletion(): CompletionSource[] {
    return [basicCompletion(codeFenceRegex, '```plantuml\n\n```')]
  }
}
