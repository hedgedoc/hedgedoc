/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ChangeSpec, Transaction } from '@codemirror/state'
import { Annotation } from '@codemirror/state'
import type { EditorView, PluginValue, ViewUpdate } from '@codemirror/view'
import type { Text as YText, Transaction as YTransaction, YTextEvent } from 'yjs'

const syncAnnotation = Annotation.define()

/**
 * Synchronizes the content of a codemirror with a {@link YText y.js text channel}.
 */
export class YTextSyncViewPlugin implements PluginValue {
  private readonly observer: YTextSyncViewPlugin['onYTextUpdate']

  constructor(
    private view: EditorView,
    private readonly yText: YText,
    pluginLoaded: () => void
  ) {
    this.observer = this.onYTextUpdate.bind(this)
    this.yText.observe(this.observer)
    pluginLoaded()
  }

  private onYTextUpdate(event: YTextEvent, transaction: YTransaction): void {
    if (transaction.origin === this) {
      return
    }
    this.view.dispatch({ changes: this.calculateChanges(event), annotations: [syncAnnotation.of(this)] })
  }

  private calculateChanges(event: YTextEvent): ChangeSpec[] {
    const [changes] = event.delta.reduce<[ChangeSpec[], number]>(
      ([changes, position], delta) => {
        if (delta.insert !== undefined && typeof delta.insert === 'string') {
          changes.push({ from: position, to: position, insert: delta.insert })
          return [changes, position]
        } else if (delta.delete !== undefined) {
          changes.push({ from: position, to: position + delta.delete, insert: '' })
          return [changes, position + delta.delete]
        } else if (delta.retain !== undefined) {
          return [changes, position + delta.retain]
        } else {
          return [changes, position]
        }
      },
      [[], 0]
    )
    return changes
  }

  public update(update: ViewUpdate): void {
    if (!update.docChanged) {
      return
    }
    update.transactions
      .filter((transaction) => transaction.annotation(syncAnnotation) !== this)
      .forEach((transaction) => this.applyTransaction(transaction))
  }

  private applyTransaction(transaction: Transaction): void {
    this.yText.doc?.transact(() => {
      let positionAdjustment = 0
      transaction.changes.iterChanges((fromA, toA, fromB, toB, insert) => {
        const insertText = insert.sliceString(0, insert.length, '\n')
        if (fromA !== toA) {
          this.yText.delete(fromA + positionAdjustment, toA - fromA)
        }
        if (insertText.length > 0) {
          this.yText.insert(fromA + positionAdjustment, insertText)
        }
        positionAdjustment += insertText.length - (toA - fromA)
      })
    }, this)
  }

  public destroy(): void {
    this.yText.unobserve(this.observer)
  }
}
