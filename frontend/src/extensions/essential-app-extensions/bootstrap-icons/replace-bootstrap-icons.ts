/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isBootstrapIconName } from '../../../components/common/icons/bootstrap-icons'
import type { RegexOptions } from '../../../external-types/markdown-it-regex/interface'
import { BootstrapIconMarkdownExtension } from './bootstrap-icon-markdown-extension'
import type MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'

const biRegex = /:bi-([\w-]+):/i

/**
 * Replacer for bootstrap icon via the :bi-$name: syntax.
 */
export const replaceBootstrapIconsMarkdownItPlugin: MarkdownIt.PluginSimple = (markdownIt: MarkdownIt) =>
  markdownItRegex(markdownIt, {
    name: 'bootstrap-icons',
    regex: biRegex,
    replace: (match) => {
      if (isBootstrapIconName(match)) {
        // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
        // noinspection CheckTagEmptyBody
        return `<${BootstrapIconMarkdownExtension.tagName} id="${match}"></${BootstrapIconMarkdownExtension.tagName}>`
      } else {
        return `:bi-${match}:`
      }
    }
  } as RegexOptions)
