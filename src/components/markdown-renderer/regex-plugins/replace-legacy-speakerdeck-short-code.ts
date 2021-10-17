/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import type MarkdownIt from 'markdown-it/lib'

const finalRegex = /^{%speakerdeck (\w+\/[\w-]+) ?%}$/

export const legacySpeakerdeckShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, {
    name: 'legacy-speakerdeck-short-code',
    regex: finalRegex,
    replace: (match: string) => {
      return `<a target="_blank" rel="noopener noreferrer" href="https://speakerdeck.com/${match}">https://speakerdeck.com/${match}</a>`
    }
  })
}
