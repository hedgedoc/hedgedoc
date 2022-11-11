/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'
import { NoteInfoLine } from './note-info-line'
import { UnitalicBoldContent } from './unitalic-bold-content'
import { useEditorToRendererCommunicator } from '../../render-context/editor-to-renderer-communicator-context-provider'
import type { OnWordCountCalculatedMessage } from '../../../render-page/window-post-message-communicator/rendering-message'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useEditorReceiveHandler } from '../../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import { cypressId } from '../../../../utils/cypress-attribute'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Creates a new info line for the document information dialog that holds the
 * word count of the note, based on counting in the rendered output.
 */
export const NoteInfoLineWordCount: React.FC<PropsWithChildren<unknown>> = () => {
  useTranslation()
  const editorToRendererCommunicator = useEditorToRendererCommunicator()
  const [wordCount, setWordCount] = useState<number | null>(null)

  useEditorReceiveHandler(
    CommunicationMessageType.ON_WORD_COUNT_CALCULATED,
    useCallback((values: OnWordCountCalculatedMessage) => setWordCount(values.words), [setWordCount])
  )

  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)
  useEffect(() => {
    if (rendererReady) {
      editorToRendererCommunicator.sendMessageToOtherSide({ type: CommunicationMessageType.GET_WORD_COUNT })
    }
  }, [editorToRendererCommunicator, rendererReady])

  return (
    <NoteInfoLine icon={'align-left'} size={'2x'}>
      <ShowIf condition={wordCount === null}>
        <Trans i18nKey={'common.loading'} />
      </ShowIf>
      <ShowIf condition={wordCount !== null}>
        <Trans i18nKey={'editor.modal.documentInfo.words'}>
          <UnitalicBoldContent text={wordCount ?? ''} {...cypressId('document-info-word-count')} />
        </Trans>
      </ShowIf>
    </NoteInfoLine>
  )
}
