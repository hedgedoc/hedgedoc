/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { KatexMarkdownExtension } from './katex-markdown-extension'

/**
 * Adds support for LaTeX rendering using KaTeX to the markdown rendering.
 *
 * @see https://katex.org/
 */
export class KatexAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new KatexMarkdownExtension()]
  }
}
