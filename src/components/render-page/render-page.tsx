/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import equal from "fast-deep-equal"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { ApplicationState } from '../../redux'
import { setDarkMode } from '../../redux/dark-mode/methods'
import { setDocumentMetadata } from '../../redux/document-content/methods'
import { ScrollingDocumentRenderPane } from '../editor/document-renderer-pane/scrolling-document-render-pane'
import { ScrollState } from '../editor/scroll/scroll-props'
import { YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { ImageClickHandler } from '../markdown-renderer/replace-components/image/image-replacer'
import { IframeRendererToEditorCommunicator } from './iframe-renderer-to-editor-communicator'

export const RenderPage: React.FC = () => {
  useApplyDarkMode()

  const [markdownContent, setMarkdownContent] = useState('')
  const [isWide, setWide] = useState(false)
  const [scrollState, setScrollState] = useState<ScrollState>({ firstLineInView: 1, scrolledPercentage: 0 })
  const [baseUrl, setBaseUrl] = useState<string>()

  const editorOrigin = useSelector((state: ApplicationState) => state.config.iframeCommunication.editorOrigin)

  const iframeCommunicator = useMemo(() => {
    const newCommunicator = new IframeRendererToEditorCommunicator()
    newCommunicator.setOtherSide(window.parent, editorOrigin)
    return newCommunicator
  }, [editorOrigin])

  useEffect(() => {
    iframeCommunicator.sendRendererReady()
    return () => iframeCommunicator.unregisterEventListener()
  }, [iframeCommunicator])

  useEffect(() => iframeCommunicator.onSetBaseUrl(setBaseUrl), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onSetMarkdownContent(setMarkdownContent), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onSetDarkMode(setDarkMode), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onSetWide(setWide), [iframeCommunicator])
  useEffect(() => iframeCommunicator.onSetScrollState((newScrollState) => {
    if (!equal(scrollState, newScrollState)) {
      setScrollState(newScrollState)
    }
  }), [iframeCommunicator, scrollState])

  const onTaskCheckedChange = useCallback((lineInMarkdown: number, checked: boolean) => {
    iframeCommunicator.sendTaskCheckBoxChange(lineInMarkdown, checked)
  }, [iframeCommunicator])

  const onFirstHeadingChange = useCallback((firstHeading?: string) => {
    iframeCommunicator.sendFirstHeadingChanged(firstHeading)
  }, [iframeCommunicator])

  const onMakeScrollSource = useCallback(() => {
    iframeCommunicator.sendSetScrollSourceToRenderer()
  }, [iframeCommunicator])

  const onMetaDataChange = useCallback((metaData?: YAMLMetaData) => {
    setDocumentMetadata(metaData)
    iframeCommunicator.sendSetMetaData(metaData)
  }, [iframeCommunicator])

  const onScroll = useCallback((scrollState: ScrollState) => {
    iframeCommunicator.sendSetScrollState(scrollState)
  }, [iframeCommunicator])

  const onImageClick: ImageClickHandler = useCallback((event) => {
    const image = event.target as HTMLImageElement
    if (image.src === '') {
      return
    }
    iframeCommunicator.sendClickedImageUrl({
      src: image.src,
      alt: image.alt,
      title: image.title
    })
  }, [iframeCommunicator])

  if (!baseUrl) {
    return null
  }

  return (
    <div className={"vh-100 w-100"}>
      <ScrollingDocumentRenderPane
        extraClasses={'w-100'}
        markdownContent={markdownContent}
        wide={isWide}
        onTaskCheckedChange={onTaskCheckedChange}
        onFirstHeadingChange={onFirstHeadingChange}
        onMakeScrollSource={onMakeScrollSource}
        onMetadataChange={onMetaDataChange}
        scrollState={scrollState}
        onScroll={onScroll}
        baseUrl={baseUrl}
        onImageClick={onImageClick}/>
    </div>
  )
}

export default RenderPage
