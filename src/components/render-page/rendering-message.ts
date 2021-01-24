/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ScrollState } from '../editor/scroll/scroll-props'
import { YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'

export enum RenderIframeMessageType {
  SET_MARKDOWN_CONTENT = 'SET_MARKDOWN_CONTENT',
  RENDERER_READY = 'RENDERER_READY',
  SET_DARKMODE = 'SET_DARKMODE',
  SET_WIDE = 'SET_WIDE',
  ON_TASK_CHECKBOX_CHANGE = 'ON_TASK_CHECKBOX_CHANGE',
  ON_FIRST_HEADING_CHANGE = 'ON_FIRST_HEADING_CHANGE',
  SET_SCROLL_SOURCE_TO_RENDERER = 'SET_SCROLL_SOURCE_TO_RENDERER',
  SET_SCROLL_STATE = 'SET_SCROLL_STATE',
  ON_SET_META_DATA = 'ON_SET_META_DATA',
  IMAGE_CLICKED = 'IMAGE_CLICKED',
  SET_BASE_URL = 'SET_BASE_URL'
}

export interface RendererToEditorSimpleMessage {
  type: RenderIframeMessageType.RENDERER_READY | RenderIframeMessageType.SET_SCROLL_SOURCE_TO_RENDERER
}

export interface SetDarkModeMessage {
  type: RenderIframeMessageType.SET_DARKMODE,
  activated: boolean
}

export interface ImageDetails {
  alt?: string
  src: string
  title?: string
}

export interface SetBaseUrlMessage {
  type: RenderIframeMessageType.SET_BASE_URL,
  baseUrl: string
}

export interface ImageClickedMessage {
  type: RenderIframeMessageType.IMAGE_CLICKED,
  details: ImageDetails
}

export interface SetWideMessage {
  type: RenderIframeMessageType.SET_WIDE,
  activated: boolean
}

export interface SetMarkdownContentMessage {
  type: RenderIframeMessageType.SET_MARKDOWN_CONTENT,
  content: string
}

export interface SetScrollStateMessage {
  type: RenderIframeMessageType.SET_SCROLL_STATE,
  scrollState: ScrollState
}

export interface OnTaskCheckboxChangeMessage {
  type: RenderIframeMessageType.ON_TASK_CHECKBOX_CHANGE,
  lineInMarkdown: number,
  checked: boolean
}

export interface OnFirstHeadingChangeMessage {
  type: RenderIframeMessageType.ON_FIRST_HEADING_CHANGE,
  firstHeading: string | undefined
}

export interface OnMetadataChangeMessage {
  type: RenderIframeMessageType.ON_SET_META_DATA,
  metaData: YAMLMetaData | undefined
}

export type EditorToRendererIframeMessage =
  SetMarkdownContentMessage |
  SetDarkModeMessage |
  SetWideMessage |
  SetScrollStateMessage |
  SetBaseUrlMessage

export type RendererToEditorIframeMessage =
  RendererToEditorSimpleMessage |
  OnFirstHeadingChangeMessage |
  OnTaskCheckboxChangeMessage |
  OnMetadataChangeMessage |
  SetScrollStateMessage |
  ImageClickedMessage
