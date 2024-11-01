/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { useEditorReceiveHandler } from '../../../../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import type { OnWordCountCalculatedMessage } from '../../../../../render-page/window-post-message-communicator/rendering-message'
import { CommunicationMessageType } from '../../../../../render-page/window-post-message-communicator/rendering-message'
import { useEditorToRendererCommunicator } from '../../../../render-context/editor-to-renderer-communicator-context-provider'
import { SidebarMenuInfoEntry } from '../../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import React, { useCallback, useEffect, useState } from 'react'
import { AlignStart as IconAlignStart } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

interface NoteInfoLineWordCountProps {
  visible: boolean
}

/**
 * Creates a new info line for the document information dialog that holds the
 * word count of the note, based on counting in the rendered output.
 */
export const NoteInfoLineWordCount: React.FC<NoteInfoLineWordCountProps> = ({ visible }) => {
  useTranslation()
  const editorToRendererCommunicator = useEditorToRendererCommunicator()
  const [wordCount, setWordCount] = useState<number | null>(null)

  useEditorReceiveHandler(
    CommunicationMessageType.ON_WORD_COUNT_CALCULATED,
    useCallback((values: OnWordCountCalculatedMessage) => setWordCount(values.words), [setWordCount])
  )

  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)
  useEffect(() => {
    if (rendererReady && visible) {
      editorToRendererCommunicator?.sendMessageToOtherSide({ type: CommunicationMessageType.GET_WORD_COUNT })
    }
  }, [editorToRendererCommunicator, rendererReady, visible])

  return (
    <SidebarMenuInfoEntry titleI18nKey={'editor.noteInfo.wordCount'} icon={IconAlignStart}>
      {wordCount === null && <Trans i18nKey={'common.loading'} />}
      {wordCount !== null && <span {...cypressId('document-info-word-count')}>{wordCount}</span>}
    </SidebarMenuInfoEntry>
  )
}
