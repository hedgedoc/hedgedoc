/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RemoteCursor } from './cursor-layers-extensions'
import { remoteCursorUpdateEffect } from './cursor-layers-extensions'
import type { EditorView, PluginValue } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'

/**
 * Listens for remote cursor state messages from the backend and dispatches them into the codemirror.
 */
export class ReceiveRemoteCursorViewPlugin implements PluginValue {
  private readonly listener: Listener

  constructor(view: EditorView, messageTransporter: MessageTransporter) {
    this.listener = messageTransporter.on(
      MessageType.REALTIME_USER_STATE_SET,
      ({ payload }) => {
        const cursors = payload.users
          .map((user) => {
            if (!user.cursor) {
              return undefined
            }
            return {
              from: user.cursor.from,
              to: user.cursor.to,
              displayName: user.displayName,
              styleIndex: user.styleIndex
            }
          })
          .filter((value) => value !== undefined) as RemoteCursor[]
        view.dispatch({
          effects: [remoteCursorUpdateEffect.of(cursors)]
        })
      },
      { objectify: true }
    ) as Listener
  }

  destroy() {
    this.listener.off()
  }
}
