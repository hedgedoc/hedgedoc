/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import type MarkdownIt from 'markdown-it'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../replace-components/custom-tag-with-id-component-replacer'
import { replaceVimeoLinkMarkdownItPlugin } from './replace-vimeo-link'
import { VimeoFrame } from './vimeo-frame'
import { legacyVimeoRegex, replaceLegacyVimeoShortCodeMarkdownItPlugin } from './replace-legacy-vimeo-short-code'
import type { Linter } from '../../../editor-page/editor-pane/linter/linter'
import { SingleLineRegexLinter } from '../../../editor-page/editor-pane/linter/single-line-regex-linter'
import { t } from 'i18next'

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

  public buildLinter(): Linter[] {
    return [
      new SingleLineRegexLinter(
        legacyVimeoRegex,
        t('editor.linter.shortcode', { shortcode: 'Vimeo' }),
        (match: string) => `https://player.vimeo.com/video/${match}`
      )
    ]
  }
}
