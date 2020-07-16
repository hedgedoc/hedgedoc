import equal from 'deep-equal'
import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import anchor from 'markdown-it-anchor'
import markdownItContainer from 'markdown-it-container'
import definitionList from 'markdown-it-deflist'
import emoji from 'markdown-it-emoji'
import footnote from 'markdown-it-footnote'
import imsize from 'markdown-it-imsize'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import mathJax from 'markdown-it-mathjax'
import markdownItRegex from 'markdown-it-regex'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import taskList from 'markdown-it-task-lists'
import toc from 'markdown-it-toc-done-right'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import ReactHtmlParser, { convertNodeToElement, Transform } from 'react-html-parser'
import MathJaxReact from 'react-mathjax'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { slugify } from '../../../utils/slugify'
import { createRenderContainer, validAlertLevels } from './container-plugins/alert'
import { highlightedCode } from './markdown-it-plugins/highlighted-code'
import { linkifyExtra } from './markdown-it-plugins/linkify-extra'
import { MarkdownItParserDebugger } from './markdown-it-plugins/parser-debugger'
import './markdown-renderer.scss'
import { replaceAsciinemaLink } from './regex-plugins/replace-asciinema-link'
import { replaceGistLink } from './regex-plugins/replace-gist-link'
import { replaceLegacyGistShortCode } from './regex-plugins/replace-legacy-gist-short-code'
import { replaceLegacySlideshareShortCode } from './regex-plugins/replace-legacy-slideshare-short-code'
import { replaceLegacySpeakerdeckShortCode } from './regex-plugins/replace-legacy-speakerdeck-short-code'
import { replaceLegacyVimeoShortCode } from './regex-plugins/replace-legacy-vimeo-short-code'
import { replaceLegacyYoutubeShortCode } from './regex-plugins/replace-legacy-youtube-short-code'
import { replacePdfShortCode } from './regex-plugins/replace-pdf-short-code'
import { replaceQuoteExtraAuthor } from './regex-plugins/replace-quote-extra-author'
import { replaceQuoteExtraColor } from './regex-plugins/replace-quote-extra-color'
import { replaceQuoteExtraTime } from './regex-plugins/replace-quote-extra-time'
import { replaceVimeoLink } from './regex-plugins/replace-vimeo-link'
import { replaceYouTubeLink } from './regex-plugins/replace-youtube-link'
import { ComponentReplacer, SubNodeConverter } from './replace-components/ComponentReplacer'
import { AsciinemaReplacer } from './replace-components/asciinema/asciinema-replacer'
import { GistReplacer } from './replace-components/gist/gist-replacer'
import { HighlightedCodeReplacer } from './replace-components/highlighted-fence/highlighted-fence-replacer'
import { ImageReplacer } from './replace-components/image/image-replacer'
import { MathjaxReplacer } from './replace-components/mathjax/mathjax-replacer'
import { PdfReplacer } from './replace-components/pdf/pdf-replacer'
import { PossibleWiderReplacer } from './replace-components/possible-wider/possible-wider-replacer'
import { QuoteOptionsReplacer } from './replace-components/quote-options/quote-options-replacer'
import { TocReplacer } from './replace-components/toc/toc-replacer'
import { VimeoReplacer } from './replace-components/vimeo/vimeo-replacer'
import { YoutubeReplacer } from './replace-components/youtube/youtube-replacer'

export interface MarkdownRendererProps {
  content: string
  wide?: boolean
  className?: string
  onTocChange?: (ast: TocAst) => void
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className, onTocChange, wide }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  const [lastTocAst, setLastTocAst] = useState<TocAst>()

  const markdownIt = useMemo(() => {
    const md = new MarkdownIt('default', {
      html: true,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    md.use(taskList)
    md.use(emoji)
    md.use(abbreviation)
    md.use(definitionList)
    md.use(subscript)
    md.use(superscript)
    md.use(inserted)
    md.use(marked)
    md.use(footnote)
    md.use(imsize)
    // noinspection CheckTagEmptyBody
    md.use(anchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkClass: 'heading-anchor text-dark',
      permalinkSymbol: '<i class="fa fa-link"></i>'
    })
    md.use(mathJax({
      beforeMath: '<codimd-mathjax>',
      afterMath: '</codimd-mathjax>',
      beforeInlineMath: '<codimd-mathjax inline>',
      afterInlineMath: '</codimd-mathjax>',
      beforeDisplayMath: '<codimd-mathjax>',
      afterDisplayMath: '</codimd-mathjax>'
    }))
    md.use(markdownItRegex, replaceLegacyYoutubeShortCode)
    md.use(markdownItRegex, replaceLegacyVimeoShortCode)
    md.use(markdownItRegex, replaceLegacyGistShortCode)
    md.use(markdownItRegex, replaceLegacySlideshareShortCode)
    md.use(markdownItRegex, replaceLegacySpeakerdeckShortCode)
    md.use(markdownItRegex, replacePdfShortCode)
    md.use(markdownItRegex, replaceAsciinemaLink)
    md.use(markdownItRegex, replaceYouTubeLink)
    md.use(markdownItRegex, replaceVimeoLink)
    md.use(markdownItRegex, replaceGistLink)
    md.use(highlightedCode)
    md.use(markdownItRegex, replaceQuoteExtraAuthor)
    md.use(markdownItRegex, replaceQuoteExtraColor)
    md.use(markdownItRegex, replaceQuoteExtraTime)
    md.use(toc, {
      placeholder: '(\\[TOC\\]|\\[toc\\])',
      listType: 'ul',
      level: [1, 2, 3],
      callback: (code: string, ast: TocAst): void => {
        setTocAst(ast)
      },
      slugify: slugify
    })
    md.use(linkifyExtra)
    md.use(MarkdownItParserDebugger)

    validAlertLevels.forEach(level => {
      md.use(markdownItContainer, level, { render: createRenderContainer(level) })
    })

    return md
  }, [])

  useEffect(() => {
    if (onTocChange && tocAst && !equal(tocAst, lastTocAst)) {
      onTocChange(tocAst)
      setLastTocAst(tocAst)
    }
  }, [tocAst, onTocChange, lastTocAst])

  const tryToReplaceNode = (node: DomElement, index: number, allReplacers: ComponentReplacer[], nodeConverter: SubNodeConverter) => {
    return allReplacers
      .map((componentReplacer) => componentReplacer.getReplacement(node, index, nodeConverter))
      .find((replacement) => !!replacement)
  }

  const result: ReactElement[] = useMemo(() => {
    const allReplacers: ComponentReplacer[] = [
      new PossibleWiderReplacer(),
      new GistReplacer(),
      new YoutubeReplacer(),
      new VimeoReplacer(),
      new AsciinemaReplacer(),
      new PdfReplacer(),
      new ImageReplacer(),
      new TocReplacer(),
      new HighlightedCodeReplacer(),
      new QuoteOptionsReplacer(),
      new MathjaxReplacer()
    ]
    const html: string = markdownIt.render(content)

    const transform: Transform = (node, index) => {
      const subNodeConverter = (subNode: DomElement, subIndex: number) => convertNodeToElement(subNode, subIndex, transform)
      return tryToReplaceNode(node, index, allReplacers, subNodeConverter) || convertNodeToElement(node, index, transform)
    }
    return ReactHtmlParser(html, { transform: transform })
  }, [content, markdownIt])

  return (
    <div className={`markdown-body ${className || ''} d-flex flex-column align-items-center ${wide ? 'wider' : ''}`}>
      <MathJaxReact.Provider>
        {result}
      </MathJaxReact.Provider>
    </div>
  )
}
