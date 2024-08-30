/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createCursorCssClass } from './create-cursor-css-class'
import { RemoteCursorMarker } from './remote-cursor-marker'
import styles from './style.module.scss'
import type { Extension, Transaction } from '@codemirror/state'
import { EditorSelection, StateEffect, StateField } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { layer, RectangleMarker } from '@codemirror/view'
import { Optional } from '@mrdrogdrog/optional'
import equal from 'fast-deep-equal'

export interface RemoteCursor {
  displayName: string
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
export const remoteCursorStateField = StateField.define<RemoteCursor[]>({
  compare(a: RemoteCursor[], b: RemoteCursor[]): boolean {
    return equal(a, b)
  },
  create(): RemoteCursor[] {
    return []
  },
  update(currentValue: RemoteCursor[], transaction: Transaction): RemoteCursor[] {
    return Optional.ofNullable(transaction.effects.find((effect) => effect.is(remoteCursorUpdateEffect)))
      .map((remoteCursor) => remoteCursor.value)
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
export const createCursorLayer = (): Extension =>
  layer({
    above: true,
    class: styles.cursorLayer,
    update: isRemoteCursorUpdate,
    markers: (view) => {
      return view.state.field(remoteCursorStateField).flatMap((remoteCursor) => {
        const selectionRange = EditorSelection.cursor(remoteCursor.from)
        return RemoteCursorMarker.createCursor(view, selectionRange, remoteCursor.displayName, remoteCursor.styleIndex)
      })
    }
  })

/**
 * Creates the codemirror extension that renders the blinking remote cursor layer.
 * @return The created codemirror extension
 */
export const createSelectionLayer = (): Extension =>
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
