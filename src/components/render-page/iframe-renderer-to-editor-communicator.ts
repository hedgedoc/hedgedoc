/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import { IframeCommunicator } from './iframe-communicator'
import {
  BaseConfiguration,
  EditorToRendererIframeMessage,
  ImageDetails,
  RendererToEditorIframeMessage,
  RenderIframeMessageType
} from './rendering-message'
import { RendererFrontmatterInfo } from '../common/note-frontmatter/types'

export class IframeRendererToEditorCommunicator extends IframeCommunicator<
  RendererToEditorIframeMessage,
  EditorToRendererIframeMessage
> {
  private onSetMarkdownContentHandler?: (markdownContent: string) => void
  private onSetDarkModeHandler?: (darkModeActivated: boolean) => void
  private onSetScrollStateHandler?: (scrollState: ScrollState) => void
  private onSetBaseConfigurationHandler?: (baseConfiguration: BaseConfiguration) => void
  private onGetWordCountHandler?: () => void
  private onSetFrontmatterInfoHandler?: (frontmatterInfo: RendererFrontmatterInfo) => void

  public onSetBaseConfiguration(handler?: (baseConfiguration: BaseConfiguration) => void): void {
    this.onSetBaseConfigurationHandler = handler
  }

  public onSetMarkdownContent(handler?: (markdownContent: string) => void): void {
    this.onSetMarkdownContentHandler = handler
  }

  public onSetDarkMode(handler?: (darkModeActivated: boolean) => void): void {
    this.onSetDarkModeHandler = handler
  }

  public onSetScrollState(handler?: (scrollState: ScrollState) => void): void {
    this.onSetScrollStateHandler = handler
  }

  public onGetWordCount(handler?: () => void): void {
    this.onGetWordCountHandler = handler
  }

  public onSetFrontmatterInfo(handler?: (frontmatterInfo: RendererFrontmatterInfo) => void): void {
    this.onSetFrontmatterInfoHandler = handler
  }

  public sendRendererReady(): void {
    this.enableCommunication()
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.RENDERER_READY
    })
  }

  public sendTaskCheckBoxChange(lineInMarkdown: number, checked: boolean): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_TASK_CHECKBOX_CHANGE,
      checked,
      lineInMarkdown
    })
  }

  public sendFirstHeadingChanged(firstHeading: string | undefined): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_FIRST_HEADING_CHANGE,
      firstHeading
    })
  }

  public sendSetScrollSourceToRenderer(): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_SCROLL_SOURCE_TO_RENDERER
    })
  }

  public sendSetScrollState(scrollState: ScrollState): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_SCROLL_STATE,
      scrollState
    })
  }

  public sendClickedImageUrl(details: ImageDetails): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.IMAGE_CLICKED,
      details: details
    })
  }

  public sendHeightChange(height: number): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_HEIGHT_CHANGE,
      height
    })
  }

  public sendWordCountCalculated(words: number): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_WORD_COUNT_CALCULATED,
      words
    })
  }

  protected handleEvent(event: MessageEvent<EditorToRendererIframeMessage>): boolean | undefined {
    const renderMessage = event.data
    switch (renderMessage.type) {
      case RenderIframeMessageType.SET_MARKDOWN_CONTENT:
        this.onSetMarkdownContentHandler?.(renderMessage.content)
        return false
      case RenderIframeMessageType.SET_DARKMODE:
        this.onSetDarkModeHandler?.(renderMessage.activated)
        return false
      case RenderIframeMessageType.SET_SCROLL_STATE:
        this.onSetScrollStateHandler?.(renderMessage.scrollState)
        return false
      case RenderIframeMessageType.SET_BASE_CONFIGURATION:
        this.onSetBaseConfigurationHandler?.(renderMessage.baseConfiguration)
        return false
      case RenderIframeMessageType.GET_WORD_COUNT:
        this.onGetWordCountHandler?.()
        return false
      case RenderIframeMessageType.SET_FRONTMATTER_INFO:
        this.onSetFrontmatterInfoHandler?.(renderMessage.frontmatterInfo)
        return false
    }
  }
}
