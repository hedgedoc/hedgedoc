/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import type MarkdownIt from 'markdown-it'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../replace-components/custom-tag-with-id-component-replacer'
import { replaceVimeoLinkMarkdownItPlugin } from './replace-vimeo-link'
import { VimeoFrame } from './vimeo-frame'
import { replaceLegacyVimeoShortCodeMarkdownItPlugin } from './replace-legacy-vimeo-short-code'

/**
 * Adds vimeo video embeddings using link detection and the legacy vimeo short code syntax.
 */
export class VimeoMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-vimeo'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    replaceLegacyVimeoShortCodeMarkdownItPlugin(markdownIt)
    replaceVimeoLinkMarkdownItPlugin(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(VimeoFrame, VimeoMarkdownExtension.tagName)]
  }

  public buildTagNameWhitelist(): string[] {
    return [VimeoMarkdownExtension.tagName]
  }
}
