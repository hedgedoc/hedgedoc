/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ScrollState } from "../editor/scroll/scroll-props"
import { YAMLMetaData } from "../editor/yaml-metadata/yaml-metadata"
import { IframeCommunicator } from "./iframe-communicator"
import {
  EditorToRendererIframeMessage,
  ImageDetails,
  RendererToEditorIframeMessage,
  RenderIframeMessageType
} from "./rendering-message"

export class IframeEditorToRendererCommunicator extends IframeCommunicator<EditorToRendererIframeMessage, RendererToEditorIframeMessage> {
  private onSetScrollSourceToRendererHandler?: () => void
  private onTaskCheckboxChangeHandler?: (lineInMarkdown: number, checked: boolean) => void
  private onFirstHeadingChangeHandler?: (heading?: string) => void
  private onMetaDataChangeHandler?: (metaData?: YAMLMetaData) => void
  private onSetScrollStateHandler?: (scrollState: ScrollState) => void
  private onRendererReadyHandler?: () => void
  private onImageClickedHandler?: (details: ImageDetails) => void

  protected handleEvent (event: MessageEvent<RendererToEditorIframeMessage>): boolean | undefined {
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
      case RenderIframeMessageType.ON_SET_META_DATA:
        this.onMetaDataChangeHandler?.(renderMessage.metaData)
        return false
      case RenderIframeMessageType.IMAGE_CLICKED:
        this.onImageClickedHandler?.(renderMessage.details)
        return false
    }
  }

  public onImageClicked (handler?: (details: ImageDetails) => void): void {
    this.onImageClickedHandler = handler
  }

  public onRendererReady (handler?: () => void): void {
    this.onRendererReadyHandler = handler
  }

  public onSetScrollSourceToRenderer (handler?: () => void): void {
    this.onSetScrollSourceToRendererHandler = handler
  }

  public onTaskCheckboxChange (handler?: (lineInMarkdown: number, checked: boolean) => void): void {
    this.onTaskCheckboxChangeHandler = handler
  }

  public onFirstHeadingChange (handler?: (heading?: string) => void): void {
    this.onFirstHeadingChangeHandler = handler
  }

  public onMetaDataChange (handler?: (metaData?: YAMLMetaData) => void): void {
    this.onMetaDataChangeHandler = handler
  }

  public onSetScrollState (handler?: (scrollState: ScrollState) => void): void {
    this.onSetScrollStateHandler = handler
  }

  public sendSetBaseUrl (baseUrl: string): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_BASE_URL,
      baseUrl
    })
  }

  public sendSetMarkdownContent (markdownContent: string): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_MARKDOWN_CONTENT,
      content: markdownContent
    })
  }

  public sendSetDarkmode (darkModeActivated: boolean): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_DARKMODE,
      activated: darkModeActivated
    })
  }

  public sendSetWide (isWide: boolean): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_WIDE,
      activated: isWide
    })
  }

  public sendScrollState (scrollState?: ScrollState): void {
    if (!scrollState) {
      return
    }
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_SCROLL_STATE,
      scrollState
    })
  }
}
