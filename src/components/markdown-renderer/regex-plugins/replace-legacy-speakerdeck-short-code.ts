/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItRegex from 'markdown-it-regex'
import MarkdownIt from 'markdown-it/lib'
import { RegexOptions } from '../../../external-types/markdown-it-regex/interface'

const finalRegex = /^{%speakerdeck (\w+\/[\w-]+) ?%}$/

export const legacySpeakerdeckShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, replaceLegacySpeakerdeckShortCode)
}

export const replaceLegacySpeakerdeckShortCode: RegexOptions = {
  name: 'legacy-speakerdeck-short-code',
  regex: finalRegex,
  replace: (match) => {
    return `<a target="_blank" rel="noopener noreferrer" href="https://speakerdeck.com//${match}">https://speakerdeck.com/${match}</a>`
  }
}
