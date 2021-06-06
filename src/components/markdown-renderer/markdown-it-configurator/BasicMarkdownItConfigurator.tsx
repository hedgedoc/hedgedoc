/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import definitionList from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'
import imsize from 'markdown-it-imsize'
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
import { RawNoteFrontmatter } from '../../editor-page/note-frontmatter/note-frontmatter'
import { TocAst } from 'markdown-it-toc-done-right'
import { LineMarkers, lineNumberMarker } from '../replace-components/linemarker/line-number-marker'
import { plantumlWithError } from '../markdown-it-plugins/plantuml'
import { headlineAnchors } from '../markdown-it-plugins/headline-anchors'
import { KatexReplacer } from '../replace-components/katex/katex-replacer'
import { YoutubeReplacer } from '../replace-components/youtube/youtube-replacer'
import { VimeoReplacer } from '../replace-components/vimeo/vimeo-replacer'
import { GistReplacer } from '../replace-components/gist/gist-replacer'
import { legacyPdfShortCode } from '../regex-plugins/replace-legacy-pdf-short-code'
import { legacySlideshareShortCode } from '../regex-plugins/replace-legacy-slideshare-short-code'
import { legacySpeakerdeckShortCode } from '../regex-plugins/replace-legacy-speakerdeck-short-code'
import { AsciinemaReplacer } from '../replace-components/asciinema/asciinema-replacer'
import { highlightedCode } from '../markdown-it-plugins/highlighted-code'
import { quoteExtraColor } from '../markdown-it-plugins/quote-extra-color'
import { quoteExtra } from '../markdown-it-plugins/quote-extra'
import { documentTableOfContents } from '../markdown-it-plugins/document-table-of-contents'
import { frontmatterExtract } from '../markdown-it-plugins/frontmatter'

export interface ConfiguratorDetails {
  useFrontmatter: boolean
  onParseError: (error: boolean) => void
  onRawMetaChange: (rawMeta: RawNoteFrontmatter) => void
  onToc: (toc: TocAst) => void
  onLineMarkers?: (lineMarkers: LineMarkers[]) => void
  useAlternativeBreaks?: boolean
}

export class BasicMarkdownItConfigurator<T extends ConfiguratorDetails> {
  protected readonly options: T
  protected configurations: MarkdownIt.PluginSimple[] = []
  protected postConfigurations: MarkdownIt.PluginSimple[] = []

  constructor(options: T) {
    this.options = options
  }

  public pushConfig(plugin: MarkdownIt.PluginSimple): this {
    this.configurations.push(plugin)
    return this
  }

  public buildConfiguredMarkdownIt(): MarkdownIt {
    const markdownIt = new MarkdownIt('default', {
      html: true,
      breaks: this.options.useAlternativeBreaks ?? true,
      langPrefix: '',
      typographer: true
    })
    this.configure(markdownIt)
    this.configurations.forEach((configuration) => markdownIt.use(configuration))
    this.postConfigurations.forEach((postConfiguration) => markdownIt.use(postConfiguration))
    return markdownIt
  }

  protected configure(markdownIt: MarkdownIt): void {
    this.configurations.push(
      plantumlWithError,
      headlineAnchors,
      KatexReplacer.markdownItPlugin,
      YoutubeReplacer.markdownItPlugin,
      VimeoReplacer.markdownItPlugin,
      GistReplacer.markdownItPlugin,
      legacyPdfShortCode,
      legacySlideshareShortCode,
      legacySpeakerdeckShortCode,
      AsciinemaReplacer.markdownItPlugin,
      highlightedCode,
      quoteExtraColor,
      quoteExtra('name', 'user'),
      quoteExtra('time', 'clock-o'),
      documentTableOfContents(this.options.onToc),
      twitterEmojis,
      abbreviation,
      definitionList,
      subscript,
      superscript,
      inserted,
      marked,
      footnote,
      imsize,
      tasksLists,
      alertContainer,
      spoilerContainer
    )

    if (this.options.useFrontmatter) {
      this.configurations.push(
        frontmatterExtract({
          onParseError: this.options.onParseError,
          onRawMetaChange: this.options.onRawMetaChange
        })
      )
    }

    if (this.options.onLineMarkers) {
      this.configurations.push(lineNumberMarker(this.options.onLineMarkers))
    }

    this.postConfigurations.push(linkifyExtra, MarkdownItParserDebugger)
  }
}
