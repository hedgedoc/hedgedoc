/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useCodemirrorReferenceContext } from '../../../change-content-context/codemirror-reference-context'
import type { RemoteCursor } from '../code-mirror-extensions/sync/remote-cursors/remote-cursors-extension'
import { remoteCursorUpdateEffect } from '../code-mirror-extensions/sync/remote-cursors/remote-cursors-extension'
import { useEffect } from 'react'

/**
 * Reads realtime user information from the global application state and sends them as updates into the codemirror.
 */
export const useSyncRealtimeUsersToCodeMirror = () => {
  const realtimeUsers = useApplicationState((state) => state.realtimeStatus.onlineUsers)
  const [codeMirrorRef] = useCodemirrorReferenceContext()

  useEffect(() => {
    const remoteCursors = realtimeUsers.map(
      (value) =>
        ({
          from: value.cursor.from,
          to: value.cursor.to,
          name: value.username,
          styleIndex: value.styleIndex
        } as RemoteCursor)
    )
    codeMirrorRef?.dispatch({
      effects: [remoteCursorUpdateEffect.of(remoteCursors)]
    })
  }, [codeMirrorRef, realtimeUsers])
}
