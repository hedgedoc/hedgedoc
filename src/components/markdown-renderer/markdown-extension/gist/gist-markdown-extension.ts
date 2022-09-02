/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../replace-components/custom-tag-with-id-component-replacer'
import { replaceGistLink } from './replace-gist-link'
import { replaceLegacyGistShortCode } from './replace-legacy-gist-short-code'
import { GistFrame } from './gist-frame'

/**
 * Adds support for embeddings of GitHub Gists by detecting gist links and the legacy gist shortcode.
 */
export class GistMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-gist'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownItRegex(markdownIt, replaceGistLink)
    markdownItRegex(markdownIt, replaceLegacyGistShortCode)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(GistFrame, GistMarkdownExtension.tagName)]
  }

  public buildTagNameAllowList(): string[] {
    return [GistMarkdownExtension.tagName]
  }
}
