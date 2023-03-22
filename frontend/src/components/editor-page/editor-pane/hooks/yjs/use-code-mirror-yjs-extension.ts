/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { YTextSyncViewPlugin } from '../../codemirror-extensions/document-sync/y-text-sync-view-plugin'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import type { YDocSyncClientAdapter } from '@hedgedoc/commons'
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
  const synchronized = useApplicationState((state) => state.realtimeStatus.isSynced)
  const connected = useApplicationState((state) => state.realtimeStatus.isConnected)

  useEffect(() => {
    if (editorReady && connected && !synchronized && yText) {
      syncAdapter.requestDocumentState()
    }
  }, [connected, editorReady, syncAdapter, synchronized, yText])

  return useMemo(
    () =>
      yText ? [ViewPlugin.define((view) => new YTextSyncViewPlugin(view, yText, () => setEditorReady(true)))] : [],
    [yText]
  )
}
