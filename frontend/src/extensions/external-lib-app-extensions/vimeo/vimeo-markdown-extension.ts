/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import { replaceLegacyVimeoShortCodeMarkdownItPlugin } from './replace-legacy-vimeo-short-code'
import { replaceVimeoLinkMarkdownItPlugin } from './replace-vimeo-link'
import { VimeoFrame } from './vimeo-frame'
import type MarkdownIt from 'markdown-it'

/**
 * Adds vimeo video embeddings using link detection and the legacy vimeo short code syntax.
 */
export class VimeoMarkdownExtension extends MarkdownRendererExtension {
  public static readonly tagName = 'app-vimeo'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    replaceLegacyVimeoShortCodeMarkdownItPlugin(markdownIt)
    replaceVimeoLinkMarkdownItPlugin(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(VimeoFrame, VimeoMarkdownExtension.tagName)]
  }

  public buildTagNameAllowList(): string[] {
    return [VimeoMarkdownExtension.tagName]
  }
}
