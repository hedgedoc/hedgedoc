/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { BootstrapIconComponentReplacer } from './bootstrap-icon-component-replacer'
import { replaceBootstrapIconsMarkdownItPlugin } from './replace-bootstrap-icons'
import type MarkdownIt from 'markdown-it'

/**
 * Adds Bootstrap icons via the :bi-$name: syntax.
 */
export class BootstrapIconMarkdownExtension extends MarkdownRendererExtension {
  public static readonly tagName = 'app-bootstrap-icon'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    replaceBootstrapIconsMarkdownItPlugin(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new BootstrapIconComponentReplacer()]
  }

  public buildTagNameAllowList(): string[] {
    return [BootstrapIconMarkdownExtension.tagName]
  }
}
