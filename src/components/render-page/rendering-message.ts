/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ScrollState } from '../editor-page/synced-scroll/scroll-props'
import { RendererFrontmatterInfo } from '../common/note-frontmatter/types'

export enum RenderIframeMessageType {
  SET_MARKDOWN_CONTENT = 'SET_MARKDOWN_CONTENT',
  RENDERER_READY = 'RENDERER_READY',
  SET_DARKMODE = 'SET_DARKMODE',
  ON_TASK_CHECKBOX_CHANGE = 'ON_TASK_CHECKBOX_CHANGE',
  ON_FIRST_HEADING_CHANGE = 'ON_FIRST_HEADING_CHANGE',
  SET_SCROLL_SOURCE_TO_RENDERER = 'SET_SCROLL_SOURCE_TO_RENDERER',
  SET_SCROLL_STATE = 'SET_SCROLL_STATE',
  IMAGE_CLICKED = 'IMAGE_CLICKED',
  ON_HEIGHT_CHANGE = 'ON_HEIGHT_CHANGE',
  SET_BASE_CONFIGURATION = 'SET_BASE_CONFIGURATION',
  GET_WORD_COUNT = 'GET_WORD_COUNT',
  ON_WORD_COUNT_CALCULATED = 'ON_WORD_COUNT_CALCULATED',
  SET_FRONTMATTER_INFO = 'SET_FRONTMATTER_INFO'
}

export interface RendererToEditorSimpleMessage {
  type: RenderIframeMessageType.RENDERER_READY | RenderIframeMessageType.SET_SCROLL_SOURCE_TO_RENDERER
}

export interface SetDarkModeMessage {
  type: RenderIframeMessageType.SET_DARKMODE
  activated: boolean
}

export interface ImageDetails {
  alt?: string
  src: string
  title?: string
}

export interface SetBaseUrlMessage {
  type: RenderIframeMessageType.SET_BASE_CONFIGURATION
  baseConfiguration: BaseConfiguration
}

export interface GetWordCountMessage {
  type: RenderIframeMessageType.GET_WORD_COUNT
}

export interface ImageClickedMessage {
  type: RenderIframeMessageType.IMAGE_CLICKED
  details: ImageDetails
}

export interface SetMarkdownContentMessage {
  type: RenderIframeMessageType.SET_MARKDOWN_CONTENT
  content: string
}

export interface SetScrollStateMessage {
  type: RenderIframeMessageType.SET_SCROLL_STATE
  scrollState: ScrollState
}

export interface OnTaskCheckboxChangeMessage {
  type: RenderIframeMessageType.ON_TASK_CHECKBOX_CHANGE
  lineInMarkdown: number
  checked: boolean
}

export interface OnFirstHeadingChangeMessage {
  type: RenderIframeMessageType.ON_FIRST_HEADING_CHANGE
  firstHeading: string | undefined
}

export interface SetFrontmatterInfoMessage {
  type: RenderIframeMessageType.SET_FRONTMATTER_INFO
  frontmatterInfo: RendererFrontmatterInfo
}

export interface OnHeightChangeMessage {
  type: RenderIframeMessageType.ON_HEIGHT_CHANGE
  height: number
}

export interface OnWordCountCalculatedMessage {
  type: RenderIframeMessageType.ON_WORD_COUNT_CALCULATED
  words: number
}

export type EditorToRendererIframeMessage =
  | SetMarkdownContentMessage
  | SetDarkModeMessage
  | SetScrollStateMessage
  | SetBaseUrlMessage
  | GetWordCountMessage
  | SetFrontmatterInfoMessage

export type RendererToEditorIframeMessage =
  | RendererToEditorSimpleMessage
  | OnFirstHeadingChangeMessage
  | OnTaskCheckboxChangeMessage
  | SetScrollStateMessage
  | ImageClickedMessage
  | OnHeightChangeMessage
  | OnWordCountCalculatedMessage

export enum RendererType {
  DOCUMENT,
  INTRO,
  SLIDESHOW
}

export interface BaseConfiguration {
  baseUrl: string
  rendererType: RendererType
}
