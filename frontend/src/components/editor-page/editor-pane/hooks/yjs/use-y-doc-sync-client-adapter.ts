/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setRealtimeSyncedState } from '../../../../../redux/realtime/methods'
import { Logger } from '../../../../../utils/logger'
import type { MessageTransporter } from '@hedgedoc/commons'
import { YDocSyncClientAdapter } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect, useMemo } from 'react'
import type { Doc } from 'yjs'

const logger = new Logger('useYDocSyncClient')

/**
 * Creates a {@link YDocSyncClientAdapter} and mirrors its sync state to the global application state.
 *
 * @param messageTransporter The {@link MessageTransporter message transporter} that sends and receive messages for the synchronisation
 * @param yDoc The {@link Doc y-doc} that should be synchronized
 * @return the created adapter
 */
export const useYDocSyncClientAdapter = (
  messageTransporter: MessageTransporter,
  yDoc: Doc | undefined
): YDocSyncClientAdapter => {
  const syncAdapter = useMemo(() => new YDocSyncClientAdapter(messageTransporter), [messageTransporter])

  useEffect(() => {
    syncAdapter.setYDoc(yDoc)
  }, [syncAdapter, yDoc])

  useEffect(() => {
    const onceSyncedListener = syncAdapter.doAsSoonAsSynced(() => {
      logger.debug('YDoc synced')
      setRealtimeSyncedState(true)
    })
    const desyncedListener = syncAdapter.eventEmitter.on(
      'desynced',
      () => {
        logger.debug('YDoc de-synced')
        setRealtimeSyncedState(false)
      },
      {
        objectify: true
      }
    ) as Listener

    return () => {
      onceSyncedListener.off()
      desyncedListener.off()
    }
  }, [messageTransporter, syncAdapter])

  return syncAdapter
}
