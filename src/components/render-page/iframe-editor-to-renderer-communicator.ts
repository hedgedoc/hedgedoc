/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NoteFrontmatter } from '../editor-page/note-frontmatter/note-frontmatter'
import { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import { IframeCommunicator } from './iframe-communicator'
import {
  EditorToRendererIframeMessage,
  ImageDetails,
  RendererToEditorIframeMessage,
  RenderIframeMessageType
} from './rendering-message'

export class IframeEditorToRendererCommunicator extends IframeCommunicator<EditorToRendererIframeMessage, RendererToEditorIframeMessage> {
  private onSetScrollSourceToRendererHandler?: () => void
  private onTaskCheckboxChangeHandler?: (lineInMarkdown: number, checked: boolean) => void
  private onFirstHeadingChangeHandler?: (heading?: string) => void
  private onFrontmatterChangeHandler?: (frontmatter?: NoteFrontmatter) => void
  private onSetScrollStateHandler?: (scrollState: ScrollState) => void
  private onRendererReadyHandler?: () => void
  private onImageClickedHandler?: (details: ImageDetails) => void

  public onFrontmatterChange(handler?: (frontmatter?: NoteFrontmatter) => void): void {
    this.onFrontmatterChangeHandler = handler
  }

  public onImageClicked(handler?: (details: ImageDetails) => void): void {
    this.onImageClickedHandler = handler
  }

  public onRendererReady(handler?: () => void): void {
    this.onRendererReadyHandler = handler
  }

  public onSetScrollSourceToRenderer(handler?: () => void): void {
    this.onSetScrollSourceToRendererHandler = handler
  }

  public onTaskCheckboxChange(handler?: (lineInMarkdown: number, checked: boolean) => void): void {
    this.onTaskCheckboxChangeHandler = handler
  }

  public onFirstHeadingChange(handler?: (heading?: string) => void): void {
    this.onFirstHeadingChangeHandler = handler
  }

  public onSetScrollState(handler?: (scrollState: ScrollState) => void): void {
    this.onSetScrollStateHandler = handler
  }

  public sendSetBaseUrl(baseUrl: string): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_BASE_URL,
      baseUrl
    })
  }

  public sendSetMarkdownContent(markdownContent: string): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_MARKDOWN_CONTENT,
      content: markdownContent
    })
  }

  public sendSetDarkmode(darkModeActivated: boolean): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_DARKMODE,
      activated: darkModeActivated
    })
  }

  public sendScrollState(scrollState?: ScrollState): void {
    if (!scrollState) {
      return
    }
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_SCROLL_STATE,
      scrollState
    })
  }

  protected handleEvent(event: MessageEvent<RendererToEditorIframeMessage>): boolean | undefined {
    const renderMessage = event.data
    switch (renderMessage.type) {
      case RenderIframeMessageType.RENDERER_READY:
        this.onRendererReadyHandler?.()
        return false
      case RenderIframeMessageType.SET_SCROLL_SOURCE_TO_RENDERER:
        this.onSetScrollSourceToRendererHandler?.()
        return false
      case RenderIframeMessageType.SET_SCROLL_STATE:
        this.onSetScrollStateHandler?.(renderMessage.scrollState)
        return false
      case RenderIframeMessageType.ON_FIRST_HEADING_CHANGE:
        this.onFirstHeadingChangeHandler?.(renderMessage.firstHeading)
        return false
      case RenderIframeMessageType.ON_TASK_CHECKBOX_CHANGE:
        this.onTaskCheckboxChangeHandler?.(renderMessage.lineInMarkdown, renderMessage.checked)
        return false
      case RenderIframeMessageType.ON_SET_FRONTMATTER:
        this.onFrontmatterChangeHandler?.(renderMessage.frontmatter)
        return false
      case RenderIframeMessageType.IMAGE_CLICKED:
        this.onImageClickedHandler?.(renderMessage.details)
        return false
    }
  }
}
