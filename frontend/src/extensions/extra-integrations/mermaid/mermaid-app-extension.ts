/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/base/markdown-renderer-extension'
import { AppExtension } from '../../base/app-extension'
import { MermaidMarkdownExtension } from './mermaid-markdown-extension'

/**
 * Adds support for chart rendering using mermaid to the markdown renderer.
 */
export class MermaidAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new MermaidMarkdownExtension()]
  }
}
