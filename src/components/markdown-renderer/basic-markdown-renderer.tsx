/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it'
import React, { RefObject, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'
import { DocumentLengthLimitReachedAlert } from './document-length-limit-reached-alert'
import { useConvertMarkdownToReactDom } from './hooks/use-convert-markdown-to-react-dom'
import './markdown-renderer.scss'
import { ComponentReplacer } from './replace-components/ComponentReplacer'
import { AdditionalMarkdownRendererProps } from './types'

export interface BasicMarkdownRendererProps {
  componentReplacers?: () => ComponentReplacer[],
  markdownIt: MarkdownIt,
  documentReference?: RefObject<HTMLDivElement>
  onBeforeRendering?: () => void
  onAfterRendering?: () => void
}

export const BasicMarkdownRenderer: React.FC<BasicMarkdownRendererProps & AdditionalMarkdownRendererProps> = (
  {
    className,
    content,
    wide,
    componentReplacers,
    markdownIt,
    documentReference,
    onBeforeRendering,
    onAfterRendering
  }) => {
  const maxLength = useSelector((state: ApplicationState) => state.config.maxDocumentLength)
  const trimmedContent = useMemo(() => content.length > maxLength ? content.substr(0, maxLength) : content, [content, maxLength])
  const markdownReactDom = useConvertMarkdownToReactDom(trimmedContent, markdownIt, componentReplacers, onBeforeRendering, onAfterRendering)

  return (
    <div className={`${className ?? ''} d-flex flex-column align-items-center ${wide ? 'wider' : ''}`}>
      <DocumentLengthLimitReachedAlert contentLength={content.length}/>
      <div ref={documentReference} className={'markdown-body w-100 d-flex flex-column align-items-center'}>
        {markdownReactDom}
      </div>
    </div>
  )
}
