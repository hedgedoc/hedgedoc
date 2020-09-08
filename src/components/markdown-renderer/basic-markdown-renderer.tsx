import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import definitionList from 'markdown-it-deflist'
import emoji from 'markdown-it-emoji'
import footnote from 'markdown-it-footnote'
import imsize from 'markdown-it-imsize'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import React, { ReactElement, RefObject, useMemo, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import ReactHtmlParser from 'react-html-parser'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'
import { ShowIf } from '../common/show-if/show-if'
import { combinedEmojiData } from './markdown-it-plugins/emoji/mapping'
import { linkifyExtra } from './markdown-it-plugins/linkify-extra'
import { MarkdownItParserDebugger } from './markdown-it-plugins/parser-debugger'
import './markdown-renderer.scss'
import { ComponentReplacer } from './replace-components/ComponentReplacer'
import { AdditionalMarkdownRendererProps, LineKeys } from './types'
import { buildTransformer } from './utils/html-react-transformer'
import { calculateNewLineNumberMapping } from './utils/line-number-mapping'

export interface BasicMarkdownRendererProps {
  componentReplacers?: ComponentReplacer[],
  onConfigureMarkdownIt?: (md: MarkdownIt) => void,
  documentReference?: RefObject<HTMLDivElement>
  onBeforeRendering?: () => void
}

export const BasicMarkdownRenderer: React.FC<BasicMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  className,
  content,
  wide,
  componentReplacers,
  onConfigureMarkdownIt,
  documentReference,
  onBeforeRendering
}) => {
  const maxLength = useSelector((state: ApplicationState) => state.config.maxDocumentLength)

  const markdownIt = useMemo(() => {
    const md = new MarkdownIt('default', {
      html: true,
      breaks: true,
      langPrefix: '',
      typographer: true
    })

    md.use(emoji, {
      defs: combinedEmojiData
    })
    md.use(abbreviation)
    md.use(definitionList)
    md.use(subscript)
    md.use(superscript)
    md.use(inserted)
    md.use(marked)
    md.use(footnote)
    md.use(imsize)

    if (onConfigureMarkdownIt) {
      onConfigureMarkdownIt(md)
    }

    md.use(linkifyExtra)
    if (process.env.NODE_ENV !== 'production') {
      md.use(MarkdownItParserDebugger)
    }

    return md
  }, [onConfigureMarkdownIt])

  const oldMarkdownLineKeys = useRef<LineKeys[]>()
  const lastUsedLineId = useRef<number>(0)

  const markdownReactDom: ReactElement[] = useMemo(() => {
    if (onBeforeRendering) {
      onBeforeRendering()
    }
    const trimmedContent = content.substr(0, maxLength)
    const html: string = markdownIt.render(trimmedContent)
    const contentLines = trimmedContent.split('\n')
    const { lines: newLines, lastUsedLineId: newLastUsedLineId } = calculateNewLineNumberMapping(contentLines, oldMarkdownLineKeys.current ?? [], lastUsedLineId.current)
    oldMarkdownLineKeys.current = newLines
    lastUsedLineId.current = newLastUsedLineId
    const transformer = componentReplacers ? buildTransformer(newLines, componentReplacers) : undefined
    return ReactHtmlParser(html, { transform: transformer })
  }, [onBeforeRendering, content, maxLength, markdownIt, componentReplacers])

  return (
    <div className={`${className || ''} d-flex flex-column align-items-center ${wide ? 'wider' : ''}`}>
      <ShowIf condition={content.length > maxLength}>
        <Alert variant='danger' dir={'auto'}>
          <Trans i18nKey={'editor.error.limitReached.description'} values={{ maxLength }}/>
        </Alert>
      </ShowIf>
      <div ref={documentReference} className={'markdown-body w-100 d-flex flex-column align-items-center'}>
        {markdownReactDom}
      </div>
    </div>
  )
}
