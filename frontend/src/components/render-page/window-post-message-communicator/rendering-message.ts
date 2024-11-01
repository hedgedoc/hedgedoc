/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DarkModePreference } from '../../../redux/dark-mode/types'
import type { ScrollState } from '../../editor-page/synced-scroll/scroll-props'
import type { SlideOptions } from '@hedgedoc/commons'

export enum CommunicationMessageType {
  SET_MARKDOWN_CONTENT = 'SET_MARKDOWN_CONTENT',
  RENDERER_READY = 'RENDERER_READY',
  SET_ADDITIONAL_CONFIGURATION = 'SET_ADDITIONAL_CONFIGURATION',
  ENABLE_RENDERER_SCROLL_SOURCE = 'ENABLE_RENDERER_SCROLL_SOURCE',
  DISABLE_RENDERER_SCROLL_SOURCE = 'DISABLE_RENDERER_SCROLL_SOURCE',
  SET_SCROLL_STATE = 'SET_SCROLL_STATE',
  ON_HEIGHT_CHANGE = 'ON_HEIGHT_CHANGE',
  SET_BASE_CONFIGURATION = 'SET_BASE_CONFIGURATION',
  GET_WORD_COUNT = 'GET_WORD_COUNT',
  ON_WORD_COUNT_CALCULATED = 'ON_WORD_COUNT_CALCULATED',
  SET_SLIDE_OPTIONS = 'SET_SLIDE_OPTIONS',
  IMAGE_UPLOAD = 'IMAGE_UPLOAD',
  EXTENSION_EVENT = 'EXTENSION_EVENT',
  SET_PRINT_MODE = 'SET_PRINT_MODE'
}

export interface NoPayloadMessage<TYPE extends CommunicationMessageType> {
  type: TYPE
}

export interface SetPrintModeConfigurationMessage {
  type: CommunicationMessageType.SET_PRINT_MODE
  printMode: boolean
}

export interface SetAdditionalConfigurationMessage {
  type: CommunicationMessageType.SET_ADDITIONAL_CONFIGURATION
  darkModePreference: DarkModePreference
  newLinesAreBreaks: boolean
}

export interface ExtensionEvent {
  type: CommunicationMessageType.EXTENSION_EVENT
  eventName: string
  payload: unknown
}

export interface ImageDetails {
  alt?: string
  src: string
  title?: string
}

export interface ImageUploadMessage {
  type: CommunicationMessageType.IMAGE_UPLOAD
  dataUri: string
  fileName: string
  lineIndex?: number
  placeholderIndexInLine?: number
}

export interface SetBaseUrlMessage {
  type: CommunicationMessageType.SET_BASE_CONFIGURATION
  baseConfiguration: BaseConfiguration
}

export interface GetWordCountMessage {
  type: CommunicationMessageType.GET_WORD_COUNT
}

export interface SetMarkdownContentMessage {
  type: CommunicationMessageType.SET_MARKDOWN_CONTENT
  content: string[]
}

export interface SetScrollStateMessage {
  type: CommunicationMessageType.SET_SCROLL_STATE
  scrollState: ScrollState
}

export interface SetSlideOptionsMessage {
  type: CommunicationMessageType.SET_SLIDE_OPTIONS
  slideOptions: SlideOptions
}

export interface OnHeightChangeMessage {
  type: CommunicationMessageType.ON_HEIGHT_CHANGE
  height: number
}

export interface OnWordCountCalculatedMessage {
  type: CommunicationMessageType.ON_WORD_COUNT_CALCULATED
  words: number
}

export type CommunicationMessages =
  | NoPayloadMessage<CommunicationMessageType.RENDERER_READY>
  | NoPayloadMessage<CommunicationMessageType.ENABLE_RENDERER_SCROLL_SOURCE>
  | NoPayloadMessage<CommunicationMessageType.DISABLE_RENDERER_SCROLL_SOURCE>
  | SetAdditionalConfigurationMessage
  | SetBaseUrlMessage
  | GetWordCountMessage
  | SetMarkdownContentMessage
  | SetScrollStateMessage
  | SetSlideOptionsMessage
  | OnHeightChangeMessage
  | OnWordCountCalculatedMessage
  | ImageUploadMessage
  | ExtensionEvent
  | SetPrintModeConfigurationMessage

export type EditorToRendererMessageType =
  | CommunicationMessageType.SET_MARKDOWN_CONTENT
  | CommunicationMessageType.SET_ADDITIONAL_CONFIGURATION
  | CommunicationMessageType.SET_SCROLL_STATE
  | CommunicationMessageType.SET_BASE_CONFIGURATION
  | CommunicationMessageType.GET_WORD_COUNT
  | CommunicationMessageType.SET_SLIDE_OPTIONS
  | CommunicationMessageType.DISABLE_RENDERER_SCROLL_SOURCE
  | CommunicationMessageType.SET_PRINT_MODE

export type RendererToEditorMessageType =
  | CommunicationMessageType.RENDERER_READY
  | CommunicationMessageType.ENABLE_RENDERER_SCROLL_SOURCE
  | CommunicationMessageType.SET_SCROLL_STATE
  | CommunicationMessageType.ON_HEIGHT_CHANGE
  | CommunicationMessageType.ON_WORD_COUNT_CALCULATED
  | CommunicationMessageType.IMAGE_UPLOAD
  | CommunicationMessageType.EXTENSION_EVENT

export enum RendererType {
  DOCUMENT = 'document',
  SIMPLE = 'simple',
  SLIDESHOW = 'slideshow'
}

export interface BaseConfiguration {
  baseUrl: string
  rendererType: RendererType
}
