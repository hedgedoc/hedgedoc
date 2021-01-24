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

export class IframeRendererToEditorCommunicator extends IframeCommunicator<RendererToEditorIframeMessage, EditorToRendererIframeMessage> {
  private onSetMarkdownContentHandler?: ((markdownContent: string) => void)
  private onSetDarkModeHandler?: ((darkModeActivated: boolean) => void)
  private onSetWideHandler?: ((wide: boolean) => void)
  private onSetScrollStateHandler?: ((scrollState: ScrollState) => void)
  private onSetBaseUrlHandler?: ((baseUrl: string) => void)

  public onSetBaseUrl (handler?: (baseUrl: string) => void): void {
    this.onSetBaseUrlHandler = handler
  }

  public onSetMarkdownContent (handler?: (markdownContent: string) => void): void {
    this.onSetMarkdownContentHandler = handler
  }

  public onSetDarkMode (handler?: (darkModeActivated: boolean) => void): void {
    this.onSetDarkModeHandler = handler
  }

  public onSetWide (handler?: (wide: boolean) => void): void {
    this.onSetWideHandler = handler
  }

  public onSetScrollState (handler?: (scrollState: ScrollState) => void): void {
    this.onSetScrollStateHandler = handler
  }

  public sendRendererReady (): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.RENDERER_READY
    })
  }

  public sendTaskCheckBoxChange (lineInMarkdown: number, checked: boolean): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_TASK_CHECKBOX_CHANGE,
      checked,
      lineInMarkdown
    })
  }

  public sendFirstHeadingChanged (firstHeading: string | undefined): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_FIRST_HEADING_CHANGE,
      firstHeading
    })
  }

  public sendSetScrollSourceToRenderer (): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_SCROLL_SOURCE_TO_RENDERER
    })
  }

  public sendSetMetaData (metaData: YAMLMetaData | undefined): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.ON_SET_META_DATA,
      metaData
    })
  }

  public sendSetScrollState (scrollState: ScrollState): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.SET_SCROLL_STATE,
      scrollState
    })
  }

  protected handleEvent (event: MessageEvent<EditorToRendererIframeMessage>): boolean | undefined {
    const renderMessage = event.data
    switch (renderMessage.type) {
      case RenderIframeMessageType.SET_MARKDOWN_CONTENT:
        this.onSetMarkdownContentHandler?.(renderMessage.content)
        return false
      case RenderIframeMessageType.SET_DARKMODE:
        this.onSetDarkModeHandler?.(renderMessage.activated)
        return false
      case RenderIframeMessageType.SET_WIDE:
        this.onSetWideHandler?.(renderMessage.activated)
        return false
      case RenderIframeMessageType.SET_SCROLL_STATE:
        this.onSetScrollStateHandler?.(renderMessage.scrollState)
        return false
      case RenderIframeMessageType.SET_BASE_URL:
        this.onSetBaseUrlHandler?.(renderMessage.baseUrl)
        return false
    }
  }

  public sendClickedImageUrl (details: ImageDetails): void {
    this.sendMessageToOtherSide({
      type: RenderIframeMessageType.IMAGE_CLICKED,
      details: details
    })
  }
}
