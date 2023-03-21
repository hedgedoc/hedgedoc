/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createCursorLayer,
  createSelectionLayer,
  remoteCursorStateField
} from '../../codemirror-extensions/remote-cursors/cursor-layers-extensions'
import { ReceiveRemoteCursorExtension } from '../../codemirror-extensions/remote-cursors/receive-remote-cursor-extension'
import { SendCursorExtension } from '../../codemirror-extensions/remote-cursors/send-cursor-extension'
import type { Extension } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
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
