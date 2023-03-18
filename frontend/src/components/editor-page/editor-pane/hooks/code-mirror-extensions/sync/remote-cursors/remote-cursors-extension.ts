/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CursorSelection } from '../../../../tool-bar/formatters/types/cursor-selection'
import { createCursorCssClass } from './create-cursor-css-class'
import { RemoteCursorMarker } from './remote-cursor-marker'
import styles from './style.module.scss'
import type { Extension, Transaction } from '@codemirror/state'
import { EditorSelection, StateEffect, StateField } from '@codemirror/state'
import type { PluginValue, ViewUpdate } from '@codemirror/view'
import { EditorView, layer, RectangleMarker, ViewPlugin } from '@codemirror/view'
import type { MessageTransporter } from '@hedgedoc/commons'
import { ConnectionState, MessageType } from '@hedgedoc/commons'
import { Optional } from '@mrdrogdrog/optional'
import type { Listener } from 'eventemitter2'
import equal from 'fast-deep-equal'
import { useMemo } from 'react'

export interface RemoteCursor {
  name: string
  from: number
  to?: number
  styleIndex: number
}

/**
 * Used to provide a new set of {@link RemoteCursor remote cursors} to a codemirror state.
 */
export const remoteCursorUpdateEffect = StateEffect.define<RemoteCursor[]>()

/**
 * Saves the currently visible {@link RemoteCursor remote cursors}
 * and saves new cursors if a transaction with an {@link remoteCursorUpdateEffect update effect} has been dispatched.
 */
const remoteCursorStateField = StateField.define<RemoteCursor[]>({
  compare(a: RemoteCursor[], b: RemoteCursor[]): boolean {
    return equal(a, b)
  },
  create(): RemoteCursor[] {
    return []
  },
  update(currentValue: RemoteCursor[], transaction: Transaction): RemoteCursor[] {
    return Optional.ofNullable(transaction.effects.find((effect) => effect.is(remoteCursorUpdateEffect)))
      .map((remoteCursor) => remoteCursor.value as RemoteCursor[])
      .orElse(currentValue)
  }
})

/**
 * Checks if the given {@link ViewUpdate view update} should trigger a rerender of remote cursor components.
 * @param update The update to check
 */
const isRemoteCursorUpdate = (update: ViewUpdate): boolean => {
  const effect = update.transactions
    .flatMap((transaction) => transaction.effects)
    .filter((effect) => effect.is(remoteCursorUpdateEffect))

  return update.docChanged || update.viewportChanged || effect.length > 0
}

/**
 * Creates the codemirror extension that renders the remote cursor selection layer.
 * @return The created codemirror extension
 */
const createCursorLayer = (): Extension =>
  layer({
    above: true,
    class: styles.cursorLayer,
    update: isRemoteCursorUpdate,
    markers: (view) => {
      return view.state.field(remoteCursorStateField).flatMap((remoteCursor) => {
        const selectionRange = EditorSelection.cursor(remoteCursor.from)
        return RemoteCursorMarker.createCursor(view, selectionRange, remoteCursor.name, remoteCursor.styleIndex)
      })
    }
  })

/**
 * Creates the codemirror extension that renders the blinking remote cursor layer.
 * @return The created codemirror extension
 */
const createSelectionLayer = (): Extension =>
  layer({
    above: false,
    class: styles.selectionLayer,
    update: isRemoteCursorUpdate,
    markers: (view) => {
      return view.state
        .field(remoteCursorStateField)
        .filter((remoteCursor) => remoteCursor.to !== undefined && remoteCursor.from !== remoteCursor.to)
        .flatMap((remoteCursor) => {
          const selectionRange = EditorSelection.range(remoteCursor.from, remoteCursor.to as number)
          return RectangleMarker.forRange(
            view,
            `${styles.cursor} ${createCursorCssClass(remoteCursor.styleIndex)}`,
            selectionRange
          )
        })
    }
  })

/**
 * Bundles all extensions that are needed for the remote cursor display.
 * @return The created codemirror extensions
 */
export const useCodeMirrorRemoteCursorsExtension = (messageTransporter: MessageTransporter): Extension => {
  return useMemo(() => {
    return [
      remoteCursorStateField.extension,
      createCursorLayer(),
      createSelectionLayer(),
      createReceiveCursorExtension(messageTransporter),
      createSendCursorExtension(messageTransporter)
    ]
  }, [messageTransporter])
}

const createSendCursorExtension = (messageTransporter: MessageTransporter): Extension => {
  let currentCursor: CursorSelection | undefined = undefined

  const sendCursor = () => {
    if (messageTransporter.getConnectionState() !== ConnectionState.CONNECTED || currentCursor === undefined) {
      return
    }
    messageTransporter.sendMessage({
      type: MessageType.REALTIME_USER_SINGLE_UPDATE,
      payload: {
        from: currentCursor.from ?? 0,
        to: currentCursor?.to
      }
    })
  }

  const extension = EditorView.updateListener.of((update) => {
    if (!update.selectionSet && !update.focusChanged && !update.docChanged) {
      return
    }
    currentCursor = update.state.selection.main
    sendCursor()
  })

  messageTransporter.on('connected', () => {
    sendCursor()
  })

  return extension
}

const createReceiveCursorExtension = (messageTransporter: MessageTransporter): Extension => {
  return ViewPlugin.define((view) => new ReceiveRemoteCursorExtension(view, messageTransporter))
}

class ReceiveRemoteCursorExtension implements PluginValue {
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
