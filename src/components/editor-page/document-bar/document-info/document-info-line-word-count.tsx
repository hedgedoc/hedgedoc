/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../../common/show-if/show-if'
import { DocumentInfoLine } from './document-info-line'
import { UnitalicBoldText } from './unitalic-bold-text'
import { useIFrameEditorToRendererCommunicator } from '../../render-context/iframe-editor-to-renderer-communicator-context-provider'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Creates a new info line for the document information dialog that holds the
 * word count of the note, based on counting in the rendered output.
 */
export const DocumentInfoLineWordCount: React.FC = () => {
  useTranslation()
  const iframeEditorToRendererCommunicator = useIFrameEditorToRendererCommunicator()
  const [wordCount, setWordCount] = useState<number | null>(null)
  const rendererReady = useApplicationState((state) => state.editorConfig.rendererReady)

  useEffect(() => {
    iframeEditorToRendererCommunicator.onWordCountCalculated((words) => {
      setWordCount(words)
    })
    return () => {
      iframeEditorToRendererCommunicator.onWordCountCalculated(undefined)
    }
  }, [iframeEditorToRendererCommunicator, setWordCount])

  useEffect(() => {
    if (rendererReady) {
      iframeEditorToRendererCommunicator.sendGetWordCount()
    }
  }, [iframeEditorToRendererCommunicator, rendererReady])

  return (
    <DocumentInfoLine icon={'align-left'} size={'2x'}>
      <ShowIf condition={wordCount === null}>
        <Trans i18nKey={'common.loading'} />
      </ShowIf>
      <ShowIf condition={wordCount !== null}>
        <Trans i18nKey={'editor.modal.documentInfo.words'}>
          <UnitalicBoldText text={wordCount ?? ''} dataCy={'document-info-word-count'} />
        </Trans>
      </ShowIf>
    </DocumentInfoLine>
  )
}
