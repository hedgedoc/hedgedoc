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
import { AsciinemaFrame } from './asciinema-frame'
import { replaceAsciinemaLink } from './replace-asciinema-link'

/**
 * Adds asciinema embeddings to the markdown rendering by detecting asciinema.org links.
 */
export class AsciinemaMarkdownExtension extends MarkdownExtension {
  public static readonly tagName = 'app-asciinema'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownItRegex(markdownIt, replaceAsciinemaLink)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(AsciinemaFrame, AsciinemaMarkdownExtension.tagName)]
  }

  public buildTagNameWhitelist(): string[] {
    return [AsciinemaMarkdownExtension.tagName]
  }
}
