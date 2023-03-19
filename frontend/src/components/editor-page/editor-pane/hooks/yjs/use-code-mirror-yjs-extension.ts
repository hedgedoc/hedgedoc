/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YTextSyncPlugin } from '../code-mirror-extensions/sync/document-sync/y-text-sync-plugin'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import type { YDocSyncClient } from '@hedgedoc/commons'
import { useMemo } from 'react'
import type { Text as YText } from 'yjs'

/**
 * Creates a {@link Extension code mirror extension} that synchronizes an editor with the given {@link YText ytext}.
 *
 * @param yText The source and target for the editor content
 * @param syncAdapter The sync adapter that processes the communication for content synchronisation.
 * @return the created extension
 */
export const useCodeMirrorYjsExtension = (yText: YText, syncAdapter: YDocSyncClient): Extension => {
  return useMemo(() => {
    return [ViewPlugin.define((view) => new YTextSyncPlugin(view, yText, () => syncAdapter.syncAsSoonAsPossible()))]
  }, [syncAdapter, yText])
}
