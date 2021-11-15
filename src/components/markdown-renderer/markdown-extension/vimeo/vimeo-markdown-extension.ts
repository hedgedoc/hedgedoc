/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../replace-components/custom-tag-with-id-component-replacer'
import { replaceVimeoLink } from './replace-vimeo-link'
import { VimeoFrame } from './vimeo-frame'
import { replaceLegacyVimeoShortCode } from './replace-legacy-vimeo-short-code'

/**
 * Adds vimeo video embeddings using link detection and the legacy vimeo short code syntax.
 */
export class VimeoMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-vimeo'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownItRegex(markdownIt, replaceVimeoLink)
    markdownItRegex(markdownIt, replaceLegacyVimeoShortCode)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(VimeoFrame, VimeoMarkdownExtension.tagName)]
  }

  public buildTagNameWhitelist(): string[] {
    return [VimeoMarkdownExtension.tagName]
  }
}
