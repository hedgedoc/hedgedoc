/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { RendererType } from '../../../components/render-page/window-post-message-communicator/rendering-message'
import type { MarkdownRendererExtensionOptions } from '../../_base-classes/app-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { ExtractFirstHeadlineEditorExtension } from './extract-first-headline-editor-extension'
import { ExtractFirstHeadlineMarkdownExtension } from './extract-first-headline-markdown-extension'

/**
 * Provides first headline extraction
 */
export class ExtractFirstHeadlineAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(options: MarkdownRendererExtensionOptions): MarkdownRendererExtension[] {
    if (options.rendererType === RendererType.SIMPLE) {
      return []
    }
    return [new ExtractFirstHeadlineMarkdownExtension(options.eventEmitter)]
  }

  buildEditorExtensionComponent(): React.FC {
    return ExtractFirstHeadlineEditorExtension
  }
}
