/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'
import { DocumentInfoLine } from './document-info-line'
import { UnitalicBoldText } from './unitalic-bold-text'
import { useEditorToRendererCommunicator } from '../../render-context/editor-to-renderer-communicator-context-provider'
import type { OnWordCountCalculatedMessage } from '../../../render-page/window-post-message-communicator/rendering-message'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useEditorReceiveHandler } from '../../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import { useEffectOnRendererReady } from '../../../render-page/window-post-message-communicator/hooks/use-effect-on-renderer-ready'
import { cypressId } from '../../../../utils/cypress-attribute'

/**
 * Creates a new info line for the document information dialog that holds the
 * word count of the note, based on counting in the rendered output.
 */
export const DocumentInfoLineWordCount: React.FC<PropsWithChildren<unknown>> = () => {
  useTranslation()
  const editorToRendererCommunicator = useEditorToRendererCommunicator()
  const [wordCount, setWordCount] = useState<number | null>(null)

  useEditorReceiveHandler(
    CommunicationMessageType.ON_WORD_COUNT_CALCULATED,
    useCallback((values: OnWordCountCalculatedMessage) => setWordCount(values.words), [setWordCount])
  )

  useEffectOnRendererReady(
    useCallback(() => {
      editorToRendererCommunicator.sendMessageToOtherSide({ type: CommunicationMessageType.GET_WORD_COUNT })
    }, [editorToRendererCommunicator])
  )

  return (
    <DocumentInfoLine icon={'align-left'} size={'2x'}>
      <ShowIf condition={wordCount === null}>
        <Trans i18nKey={'common.loading'} />
      </ShowIf>
      <ShowIf condition={wordCount !== null}>
        <Trans i18nKey={'editor.modal.documentInfo.words'}>
          <UnitalicBoldText text={wordCount ?? ''} {...cypressId('document-info-word-count')} />
        </Trans>
      </ShowIf>
    </DocumentInfoLine>
  )
}
