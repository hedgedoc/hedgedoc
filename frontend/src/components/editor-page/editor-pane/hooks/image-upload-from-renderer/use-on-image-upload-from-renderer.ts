/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getGlobalState } from '../../../../../redux'
import { Logger } from '../../../../../utils/logger'
import { useEditorReceiveHandler } from '../../../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import type { ImageUploadMessage } from '../../../../render-page/window-post-message-communicator/rendering-message'
import { CommunicationMessageType } from '../../../../render-page/window-post-message-communicator/rendering-message'
import { useCodemirrorReferenceContext } from '../../../change-content-context/codemirror-reference-context'
import type { CursorSelection } from '../../tool-bar/formatters/types/cursor-selection'
import { useHandleUpload } from '../use-handle-upload'
import { findRegexMatchInText } from './find-regex-match-in-text'
import { useCallback } from 'react'

const log = new Logger('useOnImageUpload')
const imageWithPlaceholderLinkRegex = /!\[([^\]]*)]\(https:\/\/([^)]*)\)/g

/**
 * Receives {@link CommunicationMessageType.IMAGE_UPLOAD image upload events} via iframe communication and processes the attached uploads.
 */
export const useOnImageUploadFromRenderer = (): void => {
  const [codeMirrorReference] = useCodemirrorReferenceContext()
  const handleUpload = useHandleUpload()

  useEditorReceiveHandler(
    CommunicationMessageType.IMAGE_UPLOAD,
    useCallback(
      (values: ImageUploadMessage) => {
        if (codeMirrorReference === undefined) {
          log.error("Can't upload image without codemirror reference")
          return
        }
        const { dataUri, fileName, lineIndex, placeholderIndexInLine } = values
        if (!dataUri.startsWith('data:image/')) {
          log.error('Received uri is no data uri and image!')
          return
        }

        fetch(dataUri)
          .then((result) => result.blob())
          .then((blob) => {
            const file = new File([blob], fileName, { type: blob.type })
            const { cursorSelection, alt, title } = findPlaceholderInMarkdownContent(lineIndex, placeholderIndexInLine)
            handleUpload(codeMirrorReference, file, cursorSelection, alt, title)
          })
          .catch((error) => log.error(error))
      },
      [codeMirrorReference, handleUpload]
    )
  )
}

export interface ExtractResult {
  cursorSelection?: CursorSelection
  alt?: string
  title?: string
}

/**
 * Calculates the start and end cursor position of the right image placeholder in the current markdown content.
 *
 * @param lineIndex The index of the line to change in the current markdown content.
 * @param replacementIndexInLine If multiple image placeholders are present in the target line then this number describes the index of the wanted placeholder.
 * @return the calculated start and end position or undefined if no position could be determined
 */
const findPlaceholderInMarkdownContent = (
  lineIndex: number | undefined,
  replacementIndexInLine: number | undefined
): ExtractResult => {
  if (lineIndex === undefined) {
    return {}
  }
  const noteDetails = getGlobalState().noteDetails
  if (!noteDetails) {
    return {}
  }
  const currentMarkdownContentLines = noteDetails.markdownContent.lines
  const actualLineIndex = noteDetails.startOfContentLineOffset + lineIndex
  const lineStartIndex = noteDetails.markdownContent.lineStartIndexes[actualLineIndex]
  if (lineStartIndex === undefined) {
    return {}
  }

  return (
    findImagePlaceholderInLine(
      currentMarkdownContentLines[actualLineIndex],
      lineStartIndex,
      replacementIndexInLine ?? 0
    ) ?? {}
  )
}

/**
 * Tries to find the right image placeholder in the given line.
 *
 * @param line The line that should be inspected
 * @param startIndexOfLine The absolute start index of the line in the document
 * @param replacementIndexInLine If multiple image placeholders are present in the target line then this number describes the index of the wanted placeholder.
 * @return the calculated start and end position or undefined if no position could be determined
 */
const findImagePlaceholderInLine = (
  line: string,
  startIndexOfLine: number,
  replacementIndexInLine = 0
): ExtractResult | undefined => {
  const startOfImageTag = findRegexMatchInText(line, imageWithPlaceholderLinkRegex, replacementIndexInLine)
  if (startOfImageTag === undefined || startOfImageTag.index === undefined) {
    return
  }

  const from = startIndexOfLine + startOfImageTag.index
  const to = from + startOfImageTag[0].length
  return {
    cursorSelection: {
      from,
      to
    },
    alt: startOfImageTag[1],
    title: startOfImageTag[2]
  }
}
