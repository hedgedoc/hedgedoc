/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YTextSyncPlugin } from '../../codemirror-extensions/document-sync/y-text-sync-plugin'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import type { YDocSyncClientAdapter } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect, useMemo, useState } from 'react'
import type { Text as YText } from 'yjs'

/**
 * Creates a {@link Extension code mirror extension} that synchronizes an editor with the given {@link YText ytext}.
 *
 * @param yText The source and target for the editor content
 * @param syncAdapter The sync adapter that processes the communication for content synchronisation.
 * @return the created extension
 */
export const useCodeMirrorYjsExtension = (yText: YText | undefined, syncAdapter: YDocSyncClientAdapter): Extension => {
  const [editorReady, setEditorReady] = useState(false)
  const [communicationReady, setCommunicationReady] = useState(false)

  useEffect(() => {
    const serverReadyMessageListener = syncAdapter.getMessageTransporter().doAsSoonAsReady(() => {
      setCommunicationReady(true)
    })
    const disconnectedListener = syncAdapter.getMessageTransporter().on(
      'disconnected',
      () => {
        setCommunicationReady(false)
      },
      { objectify: true }
    ) as Listener

    return () => {
      serverReadyMessageListener.off()
      disconnectedListener.off()
    }
  }, [syncAdapter])

  useEffect(() => {
    if (editorReady && communicationReady && yText && syncAdapter.getMessageTransporter().isConnected()) {
      syncAdapter.requestDocumentState()
    }
  }, [communicationReady, editorReady, syncAdapter, yText])

  return useMemo(
    () => (yText ? [ViewPlugin.define((view) => new YTextSyncPlugin(view, yText, () => setEditorReady(true)))] : []),
    [yText]
  )
}
