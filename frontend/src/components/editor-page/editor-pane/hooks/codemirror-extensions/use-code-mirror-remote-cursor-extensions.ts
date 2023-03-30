/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMayEdit } from '../../../../../hooks/common/use-may-edit'
import {
  createCursorLayer,
  createSelectionLayer,
  remoteCursorStateField
} from '../../codemirror-extensions/remote-cursors/cursor-layers-extensions'
import { ReceiveRemoteCursorViewPlugin } from '../../codemirror-extensions/remote-cursors/receive-remote-cursor-view-plugin'
import { SendCursorViewPlugin } from '../../codemirror-extensions/remote-cursors/send-cursor-view-plugin'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { useMemo } from 'react'

/**
 * Bundles all extensions that are needed for the remote cursor display.
 * @return The created codemirror extensions
 */
export const useCodeMirrorRemoteCursorsExtension = (messageTransporter: MessageTransporter): Extension => {
  const mayEdit = useMayEdit()
  return useMemo(
    () => [
      remoteCursorStateField.extension,
      createCursorLayer(),
      createSelectionLayer(),
      ViewPlugin.define((view) => new ReceiveRemoteCursorViewPlugin(view, messageTransporter)),
      ViewPlugin.define((view) => new SendCursorViewPlugin(view, messageTransporter, mayEdit))
    ],
    [mayEdit, messageTransporter]
  )
}
