/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YTextSyncPlugin } from '../code-mirror-extensions/sync/document-sync/y-text-sync-plugin'
import { yTextSyncPluginConfigFacet } from '../code-mirror-extensions/sync/document-sync/y-text-sync-plugin-config'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import { useMemo, useState } from 'react'
import type { Text as YText } from 'yjs'

/**
 * Creates a {@link Extension code mirror extension} that synchronizes an editor with the given {@link YText ytext}.
 *
 * @param yText The source and target for the editor content
 * @return the created extension
 */
export const useCodeMirrorYjsExtension = (yText: YText): [Extension, boolean] => {
  const [pluginLoaded, setPluginLoaded] = useState(false)

  const plugins = useMemo(() => {
    return [
      yTextSyncPluginConfigFacet.of({ yText, onPluginLoaded: () => setPluginLoaded(true) }),
      ViewPlugin.fromClass(YTextSyncPlugin)
    ]
  }, [yText])

  return [plugins, pluginLoaded]
}
