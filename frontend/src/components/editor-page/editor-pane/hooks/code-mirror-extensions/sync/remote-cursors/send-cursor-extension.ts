/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SelectionRange } from '@codemirror/state'
import { EditorView, PluginValue, ViewUpdate } from '@codemirror/view'
import { ConnectionState, MessageTransporter, MessageType } from '@hedgedoc/commons'

export class SendCursorExtension implements PluginValue {
  private lastCursor: SelectionRange | undefined

  constructor(private view: EditorView, private messageTransporter: MessageTransporter) {
    messageTransporter.doAsSoonAsConnected(() => {
      this.sendCursor(this.lastCursor)
    })
  }

  update(update: ViewUpdate) {
    if (!update.selectionSet && !update.focusChanged && !update.docChanged) {
      return
    }
    this.sendCursor(update.state.selection.main)
  }

  private sendCursor(currentCursor: SelectionRange | undefined) {
    if (
      this.messageTransporter.getConnectionState() !== ConnectionState.CONNECTED ||
      currentCursor === undefined ||
      (this.lastCursor?.to === currentCursor?.to && this.lastCursor?.from === currentCursor?.from)
    ) {
      return
    }
    this.lastCursor = currentCursor
    this.messageTransporter.sendMessage({
      type: MessageType.REALTIME_USER_SINGLE_UPDATE,
      payload: {
        from: currentCursor.from ?? 0,
        to: currentCursor?.to
      }
    })
  }
}
