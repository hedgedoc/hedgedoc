/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import definitionList from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'
import { imageSize } from '@hedgedoc/markdown-it-image-size'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import { alertContainer } from '../markdown-it-plugins/alert-container'
import { linkifyExtra } from '../markdown-it-plugins/linkify-extra'
import { MarkdownItParserDebugger } from '../markdown-it-plugins/parser-debugger'
import { spoilerContainer } from '../markdown-it-plugins/spoiler-container'
import { tasksLists } from '../markdown-it-plugins/tasks-lists'
import { twitterEmojis } from '../markdown-it-plugins/twitter-emojis'
import type { TocAst } from 'markdown-it-toc-done-right'
import { plantumlWithError } from '../markdown-it-plugins/plantuml'
import { KatexReplacer } from '../replace-components/katex/katex-replacer'
import { legacyPdfShortCode } from '../regex-plugins/replace-legacy-pdf-short-code'
import { legacySlideshareShortCode } from '../regex-plugins/replace-legacy-slideshare-short-code'
import { legacySpeakerdeckShortCode } from '../regex-plugins/replace-legacy-speakerdeck-short-code'
import { highlightedCode } from '../markdown-it-plugins/highlighted-code'
import { quoteExtraColor } from '../markdown-it-plugins/quote-extra-color'
import { quoteExtra } from '../markdown-it-plugins/quote-extra'
import { documentTableOfContents } from '../markdown-it-plugins/document-table-of-contents'
import { youtubeMarkdownItPlugin } from '../replace-components/youtube/youtube-markdown-it-plugin'
import { vimeoMarkdownItPlugin } from '../replace-components/vimeo/vimeo-markdown-it-plugin'
import { gistMarkdownItPlugin } from '../replace-components/gist/gist-markdown-it-plugin'
import { asciinemaMarkdownItPlugin } from '../replace-components/asciinema/replace-asciinema-link'

export interface Configuration {
  onTocChange: (toc: TocAst) => void
  useAlternativeBreaks?: boolean
  lineOffset?: number
}

export abstract class MarkdownItConfigurator<T extends Configuration> {
  protected readonly options: T
  protected configurations: MarkdownIt.PluginSimple[] = []
  protected postConfigurations: MarkdownIt.PluginSimple[] = []

  constructor(options: T) {
    this.options = options
    this.configure()
  }

  public buildConfiguredMarkdownIt(): MarkdownIt {
    const markdownIt = new MarkdownIt('default', {
      html: true,
      breaks: this.options.useAlternativeBreaks ?? true,
      langPrefix: '',
      typographer: true
    })
    this.configurations.forEach((configuration) => markdownIt.use(configuration))
    this.postConfigurations.forEach((postConfiguration) => markdownIt.use(postConfiguration))
    return markdownIt
  }

  protected configure(): void {
    this.configurations.push(
      plantumlWithError,
      KatexReplacer.markdownItPlugin,
      youtubeMarkdownItPlugin,
      vimeoMarkdownItPlugin,
      gistMarkdownItPlugin,
      asciinemaMarkdownItPlugin,
      legacyPdfShortCode,
      legacySlideshareShortCode,
      legacySpeakerdeckShortCode,
      highlightedCode,
      quoteExtraColor,
      quoteExtra('name', 'user'),
      quoteExtra('time', 'clock-o'),
      documentTableOfContents(this.options.onTocChange),
      twitterEmojis,
      abbreviation,
      definitionList,
      subscript,
      superscript,
      inserted,
      marked,
      footnote,
      imageSize,
      tasksLists,
      alertContainer,
      spoilerContainer
    )

    this.postConfigurations.push(linkifyExtra, MarkdownItParserDebugger)
  }
}
