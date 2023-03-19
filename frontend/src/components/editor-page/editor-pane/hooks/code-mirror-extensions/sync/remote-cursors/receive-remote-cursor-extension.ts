/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RemoteCursor, remoteCursorUpdateEffect } from './cursor-layers-extensions'
import type { EditorView, PluginValue } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'

export class ReceiveRemoteCursorExtension implements PluginValue {
  private readonly listener: Listener

  constructor(view: EditorView, messageTransporter: MessageTransporter) {
    this.listener = messageTransporter.on(
      MessageType.REALTIME_USER_STATE_SET,
      ({ payload }) => {
        const cursors: RemoteCursor[] = payload.map((user) => ({
          from: user.cursor.from,
          to: user.cursor.to,
          name: user.username,
          styleIndex: user.styleIndex
        }))
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
