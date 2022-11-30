/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import { VimeoMarkdownExtension } from './vimeo-markdown-extension'
import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'

const linkRegex =
  /^(?:https?:\/\/)?(?:player\.)?vimeo\.com\/(?:(?:channels|album|ondemand|groups)\/\w+\/)?(?:video\/)?(\d{6,11})(?:[?#].*)?$/i

const replaceVimeoLink: RegexOptions = {
  name: 'vimeo-link',
  regex: linkRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<${VimeoMarkdownExtension.tagName} id='${match}'></${VimeoMarkdownExtension.tagName}>`
  }
}

/**
 * Replacer for vimeo links.
 */
export const replaceVimeoLinkMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) =>
  markdownItRegex(markdownIt, replaceVimeoLink)
