/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { CustomTagWithIdComponentReplacer } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import { AsciinemaFrame } from './asciinema-frame'
import { replaceAsciinemaLinkMarkdownItPlugin } from './replace-asciinema-link'
import type MarkdownIt from 'markdown-it/lib'

/**
 * Adds asciinema embeddings to the markdown rendering by detecting asciinema.org links.
 */
export class AsciinemaMarkdownExtension extends MarkdownRendererExtension {
  public static readonly tagName = 'app-asciinema'

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    replaceAsciinemaLinkMarkdownItPlugin(markdownIt)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new CustomTagWithIdComponentReplacer(AsciinemaFrame, AsciinemaMarkdownExtension.tagName)]
  }

  public buildTagNameAllowList(): string[] {
    return [AsciinemaMarkdownExtension.tagName]
  }
}
