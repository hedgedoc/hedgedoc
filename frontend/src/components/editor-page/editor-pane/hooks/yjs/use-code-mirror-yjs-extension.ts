/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YTextSyncPlugin } from '../code-mirror-extensions/sync/document-sync/y-text-sync-plugin'
import { YTextSyncPluginConfig } from '../code-mirror-extensions/sync/document-sync/y-text-sync-plugin-config'
import { remoteCursorsExtension } from '../code-mirror-extensions/sync/remote-cursors/remote-cursors-extension'
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
      YTextSyncPluginConfig.syncPluginConfigFacet.of(new YTextSyncPluginConfig(yText, () => setPluginLoaded(true))),
      ViewPlugin.fromClass(YTextSyncPlugin),
      remoteCursorsExtension()
    ]
  }, [yText])

  return [plugins, pluginLoaded]
}
