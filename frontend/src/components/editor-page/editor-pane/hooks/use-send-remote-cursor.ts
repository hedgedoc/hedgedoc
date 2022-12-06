/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import type { Extension, SelectionRange } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const useSendRemoteCursor = (messageTransporter: MessageTransporter): Extension => {
  const [currentCursor, setCurrentCursor] = useState<SelectionRange>()

  const sendCursor = useCallback(() => {
    if (!currentCursor) {
      return
    }
    const from = currentCursor.from
    const to = currentCursor.to
    messageTransporter.sendMessage({
      type: MessageType.REALTIME_USER_SINGLE_UPDATE,
      payload: {
        from,
        to
      }
    })
  }, [currentCursor, messageTransporter])

  const isConnected = useApplicationState((state) => state.realtimeStatus.isConnected)
  useEffect(() => {
    if (isConnected) {
      sendCursor()
    }
  }, [isConnected, sendCursor])

  return useMemo(
    (): Extension => EditorView.updateListener.of((update) => setCurrentCursor(update.state.selection.main)),
    []
  )
}
