/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtensionOptions } from '../../../../extensions/base/app-extension'
import { AppExtension } from '../../../../extensions/base/app-extension'
import type { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import { ExtractFirstHeadlineEditorExtension } from './extract-first-headline-editor-extension'
import { ExtractFirstHeadlineMarkdownExtension } from './extract-first-headline-markdown-extension'

/**
 * Provides first headline extraction
 */
export class ExtractFirstHeadlineAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(options: MarkdownRendererExtensionOptions): MarkdownRendererExtension[] {
    return [new ExtractFirstHeadlineMarkdownExtension(options.eventEmitter)]
  }

  buildEditorExtensionComponent(): React.FC {
    return ExtractFirstHeadlineEditorExtension
  }
}
