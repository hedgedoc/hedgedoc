/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createCursorLayer,
  createSelectionLayer,
  remoteCursorStateField
} from './sync/remote-cursors/cursor-layers-extensions'
import { ReceiveRemoteCursorExtension } from './sync/remote-cursors/receive-remote-cursor-extension'
import { SendCursorExtension } from './sync/remote-cursors/send-cursor-extension'
import { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import { MessageTransporter } from '@hedgedoc/commons'
import { useMemo } from 'react'

/**
 * Bundles all extensions that are needed for the remote cursor display.
 * @return The created codemirror extensions
 */
export const useCodeMirrorRemoteCursorsExtension = (messageTransporter: MessageTransporter): Extension =>
  useMemo(
    () => [
      remoteCursorStateField.extension,
      createCursorLayer(),
      createSelectionLayer(),
      ViewPlugin.define((view) => new ReceiveRemoteCursorExtension(view, messageTransporter)),
      ViewPlugin.define((view) => new SendCursorExtension(view, messageTransporter))
    ],
    [messageTransporter]
  )
