/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useMemo } from 'react'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Sends the id of the current note to the renderer.
 *
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendNoteId = (rendererReady: boolean): void => {
  const noteId = useApplicationState((state) => state.noteDetails.id)

  return useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_NOTE_ID,
        noteId
      }),
      [noteId]
    ),
    rendererReady
  )
}
