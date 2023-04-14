/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { RendererType } from '../../../components/render-page/window-post-message-communicator/rendering-message'
import type { MarkdownRendererExtensionOptions } from '../../_base-classes/app-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { HeadlineAnchorsMarkdownRendererExtension } from './headline-anchors-markdown-renderer-extension'

/**
 * Provides anchor links for headlines
 */
export class HeadlineAnchorsAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(options: MarkdownRendererExtensionOptions): MarkdownRendererExtension[] {
    return options.rendererType === RendererType.DOCUMENT ? [new HeadlineAnchorsMarkdownRendererExtension()] : []
  }
}
