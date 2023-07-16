/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { SelectionRange } from '@codemirror/state'
import type { EditorView, PluginValue, ViewUpdate } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'

/**
 * Sends the main cursor of a codemirror to the backend using a given {@link MessageTransporter}.
 */
export class SendCursorViewPlugin implements PluginValue {
  private lastCursor: SelectionRange | undefined
  private listener?: Listener

  constructor(
    private view: EditorView,
    private messageTransporter: MessageTransporter,
    private mayEdit: boolean
  ) {
    if (mayEdit) {
      this.listener = messageTransporter.doAsSoonAsReady(() => {
        this.sendCursor(this.lastCursor)
      })
    }
  }

  destroy() {
    this.listener?.off()
  }

  update(update: ViewUpdate) {
    if (!update.selectionSet && !update.focusChanged && !update.docChanged) {
      return
    }
    this.sendCursor(update.state.selection.main)
  }

  private sendCursor(currentCursor: SelectionRange | undefined) {
    if (
      !this.messageTransporter.isReady() ||
      currentCursor === undefined ||
      (this.lastCursor?.to === currentCursor?.to && this.lastCursor?.from === currentCursor?.from) ||
      !this.mayEdit
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
