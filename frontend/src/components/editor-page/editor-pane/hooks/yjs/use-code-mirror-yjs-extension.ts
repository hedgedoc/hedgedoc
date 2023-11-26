/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { YTextSyncViewPlugin } from '../../codemirror-extensions/document-sync/y-text-sync-view-plugin'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import type { RealtimeDoc, YDocSyncClientAdapter } from '@hedgedoc/commons'
import { useEffect, useMemo, useState } from 'react'
import { authorshipsStateField } from '../../codemirror-extensions/authorship-ranges/authorships-state-field'

/**
 * Creates a {@link Extension code mirror extension} that synchronizes an editor with the given {@link YText ytext}.
 *
 * @param doc The {@link RealtimeDoc realtime doc} that contains the markdown content text channel
 * @param syncAdapter The sync adapter that processes the communication for content synchronisation.
 * @return the created extension
 */
export const useCodeMirrorYjsExtension = (doc: RealtimeDoc, syncAdapter: YDocSyncClientAdapter): Extension => {
  const [editorReady, setEditorReady] = useState(false)
  const synchronized = useApplicationState((state) => state.realtimeStatus.isSynced)
  const connected = useApplicationState((state) => state.realtimeStatus.isConnected)
  const ownUser = useApplicationState((state) => state.realtimeStatus.ownUser)

  useEffect(() => {
    if (editorReady && connected && !synchronized) {
      syncAdapter.requestDocumentState()
    }
  }, [connected, editorReady, syncAdapter, synchronized])

  return useMemo(
    () => [
      authorshipsStateField.extension,
      ViewPlugin.define(
        // ToDo: get ownUserId
        (view) => new YTextSyncViewPlugin(view, doc.getMarkdownContentChannel(), undefined, () => setEditorReady(true))
      )
    ],
    [doc, ownUser]
  )
}
