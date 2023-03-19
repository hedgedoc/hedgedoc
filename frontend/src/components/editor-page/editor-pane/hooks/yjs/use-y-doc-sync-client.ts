/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setRealtimeSyncedState } from '../../../../../redux/realtime/methods'
import type { MessageTransporter } from '@hedgedoc/commons'
import { YDocSyncClient } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect, useMemo } from 'react'
import type { Doc } from 'yjs'

export const useYDocSyncClient = (messageTransporter: MessageTransporter, yDoc: Doc): YDocSyncClient => {
  const syncAdapter = useMemo(() => new YDocSyncClient(yDoc, messageTransporter), [messageTransporter, yDoc])

  useEffect(() => {
    const onceSyncedListener = syncAdapter.doAsSoonAsSynced(() => setRealtimeSyncedState(true))
    const desyncedListener = syncAdapter.eventEmitter.on('desynced', () => setRealtimeSyncedState(false), {
      objectify: true
    }) as Listener

    return () => {
      onceSyncedListener?.off()
      desyncedListener.off()
    }
  }, [messageTransporter, syncAdapter])

  return syncAdapter
}
