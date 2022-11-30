/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { HighlightedCodeMarkdownExtension } from './highlighted-code-markdown-extension'

/**
 * Adds code highlighting to the markdown rendering.
 */
export class HighlightedCodeFenceAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new HighlightedCodeMarkdownExtension()]
  }
}
