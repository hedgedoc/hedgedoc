import markdownItTaskLists from '@hedgedoc/markdown-it-task-lists'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import markdownItContainer from 'markdown-it-container'
import frontmatter from 'markdown-it-front-matter'
import mathJax from 'markdown-it-mathjax'
import plantuml from 'markdown-it-plantuml'
import markdownItRegex from 'markdown-it-regex'
import toc from 'markdown-it-toc-done-right'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { TocAst } from '../../external-types/markdown-it-toc-done-right/interface'
import { ApplicationState } from '../../redux'
import { InternalLink } from '../common/links/internal-link'
import { ShowIf } from '../common/show-if/show-if'
import { slugify } from '../editor/table-of-contents/table-of-contents'
import { RawYAMLMetadata, YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { BasicMarkdownRenderer } from './basic-markdown-renderer'
import { createRenderContainer, validAlertLevels } from './markdown-it-plugins/alert-container'
import { firstHeaderExtractor } from './markdown-it-plugins/first-header-extractor'
import { highlightedCode } from './markdown-it-plugins/highlighted-code'
import { LineMarkers, lineNumberMarker } from './markdown-it-plugins/line-number-marker'
import { plantumlError } from './markdown-it-plugins/plantuml-error'
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
import { AbcReplacer } from './replace-components/abc/abc-replacer'
import { AsciinemaReplacer } from './replace-components/asciinema/asciinema-replacer'
import { CsvReplacer } from './replace-components/csv/csv-replacer'
import { FlowchartReplacer } from './replace-components/flow/flowchart-replacer'
import { GistReplacer } from './replace-components/gist/gist-replacer'
import { GraphvizReplacer } from './replace-components/graphviz/graphviz-replacer'
import { HighlightedCodeReplacer } from './replace-components/highlighted-fence/highlighted-fence-replacer'
import { ImageReplacer } from './replace-components/image/image-replacer'
import { KatexReplacer } from './replace-components/katex/katex-replacer'
import { LinemarkerReplacer } from './replace-components/linemarker/linemarker-replacer'
import { MermaidReplacer } from './replace-components/mermaid/mermaid-replacer'
import { PdfReplacer } from './replace-components/pdf/pdf-replacer'
import { PossibleWiderReplacer } from './replace-components/possible-wider/possible-wider-replacer'
import { QuoteOptionsReplacer } from './replace-components/quote-options/quote-options-replacer'
import { SequenceDiagramReplacer } from './replace-components/sequence-diagram/sequence-diagram-replacer'
import { TaskListReplacer } from './replace-components/task-list/task-list-replacer'
import { VimeoReplacer } from './replace-components/vimeo/vimeo-replacer'
import { YoutubeReplacer } from './replace-components/youtube/youtube-replacer'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'
import { usePostMetaDataOnChange } from './utils/use-post-meta-data-on-change'
import { usePostTocAstOnChange } from './utils/use-post-toc-ast-on-change'

export interface FullMarkdownRendererProps {
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | undefined) => void
  onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast: TocAst) => void
}

export const FullMarkdownRenderer: React.FC<FullMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  onFirstHeadingChange,
  onLineMarkerPositionChanged,
  onMetaDataChange,
  onTaskCheckedChange,
  onTocChange,
  content,
  className,
  wide
}) => {
  const allReplacers = useMemo(() => {
    return [
      new LinemarkerReplacer(),
      new PossibleWiderReplacer(),
      new GistReplacer(),
      new YoutubeReplacer(),
      new VimeoReplacer(),
      new AsciinemaReplacer(),
      new AbcReplacer(),
      new PdfReplacer(),
      new ImageReplacer(),
      new SequenceDiagramReplacer(),
      new CsvReplacer(),
      new FlowchartReplacer(),
      new MermaidReplacer(),
      new GraphvizReplacer(),
      new HighlightedCodeReplacer(),
      new QuoteOptionsReplacer(),
      new KatexReplacer(),
      new TaskListReplacer(onTaskCheckedChange)
    ]
  }, [onTaskCheckedChange])

  const [yamlError, setYamlError] = useState(false)

  const plantumlServer = useSelector((state: ApplicationState) => state.config.plantumlServer)

  const rawMetaRef = useRef<RawYAMLMetadata>()
  const firstHeadingRef = useRef<string>()
  const documentElement = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()
  usePostMetaDataOnChange(rawMetaRef.current, firstHeadingRef.current, onMetaDataChange, onFirstHeadingChange)
  useCalculateLineMarkerPosition(documentElement, currentLineMarkers.current, onLineMarkerPositionChanged, documentElement.current?.offsetTop ?? 0)

  const tocAst = useRef<TocAst>()
  usePostTocAstOnChange(tocAst, onTocChange)

  const configureMarkdownIt = useCallback((md: MarkdownIt): void => {
    if (onFirstHeadingChange) {
      md.use(firstHeaderExtractor(), {
        firstHeaderFound: (firstHeader: string | undefined) => {
          firstHeadingRef.current = firstHeader
        }
      })
    }

    if (onMetaDataChange) {
      md.use(frontmatter, (rawMeta: string) => {
        try {
          const meta: RawYAMLMetadata = yaml.safeLoad(rawMeta) as RawYAMLMetadata
          setYamlError(false)
          rawMetaRef.current = meta
        } catch (e) {
          console.error(e)
          setYamlError(true)
        }
      })
    }
    md.use(markdownItTaskLists, { lineNumber: true })
    if (plantumlServer) {
      md.use(plantuml, {
        openMarker: '```plantuml',
        closeMarker: '```',
        server: plantumlServer
      })
    } else {
      md.use(plantumlError)
    }

    if (onMetaDataChange) {
      md.use(frontmatter, (rawMeta: string) => {
        try {
          const meta: RawYAMLMetadata = yaml.safeLoad(rawMeta) as RawYAMLMetadata
          setYamlError(false)
          rawMetaRef.current = meta
        } catch (e) {
          console.error(e)
          setYamlError(true)
          rawMetaRef.current = ({} as RawYAMLMetadata)
        }
      })
    }
    // noinspection CheckTagEmptyBody
    md.use(anchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkClass: 'heading-anchor text-dark',
      permalinkSymbol: '<i class="fa fa-link"></i>'
    })
    md.use(mathJax({
      beforeMath: '<app-katex>',
      afterMath: '</app-katex>',
      beforeInlineMath: '<app-katex inline>',
      afterInlineMath: '</app-katex>',
      beforeDisplayMath: '<app-katex>',
      afterDisplayMath: '</app-katex>'
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
        tocAst.current = ast
      },
      slugify: slugify
    })
    validAlertLevels.forEach(level => {
      md.use(markdownItContainer, level, { render: createRenderContainer(level) })
    })
    md.use(lineNumberMarker(), {
      postLineMarkers: (lineMarkers) => {
        currentLineMarkers.current = lineMarkers
      }
    })
  }, [onFirstHeadingChange, onMetaDataChange, plantumlServer])

  const clearMetadata = useCallback(() => {
    rawMetaRef.current = undefined
  }, [])

  return (
    <div className={'position-relative'}>
      <ShowIf condition={yamlError}>
        <Alert variant='warning' dir='auto'>
          <Trans i18nKey='editor.invalidYaml'>
            <InternalLink text='yaml-metadata' href='/n/yaml-metadata' className='text-dark'/>
          </Trans>
        </Alert>
      </ShowIf>
      <BasicMarkdownRenderer className={className} wide={wide} content={content} componentReplacers={allReplacers}
        onConfigureMarkdownIt={configureMarkdownIt} documentReference={documentElement}
        onBeforeRendering={clearMetadata}/>
    </div>
  )
}
