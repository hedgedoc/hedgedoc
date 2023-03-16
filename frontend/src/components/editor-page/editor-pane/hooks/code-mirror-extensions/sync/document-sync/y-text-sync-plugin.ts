/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { YTextSyncPluginConfig } from './y-text-sync-plugin-config'
import type { ChangeSpec, Transaction } from '@codemirror/state'
import { Annotation } from '@codemirror/state'
import type { EditorView, PluginValue } from '@codemirror/view'
import type { ViewUpdate } from '@codemirror/view'
import type { Text as YText } from 'yjs'
import type { Transaction as YTransaction, YTextEvent } from 'yjs'

const syncAnnotation = Annotation.define()

export class YTextSyncPlugin implements PluginValue {
  private readonly conf: YTextSyncPluginConfig
  private readonly yText: YText
  private readonly observer: YTextSyncPlugin['onYTextUpdate']

  constructor(private view: EditorView) {
    this.conf = view.state.facet<YTextSyncPluginConfig>(YTextSyncPluginConfig.syncPluginConfigFacet)
    this.yText = this.conf.yText
    this.observer = this.onYTextUpdate.bind(this)
    this.yText.observe(this.observer)
    this.conf.onPluginLoaded()
  }

  private onYTextUpdate(event: YTextEvent, transaction: YTransaction): void {
    if (transaction.origin === this.conf) {
      return
    }
    const changes = this.calculateChanges(event)
    this.view.dispatch({ changes, annotations: [syncAnnotation.of(this.conf)] })
  }

  private calculateChanges(event: YTextEvent): ChangeSpec[] {
    const [changes] = event.delta.reduce(
      ([changes, position], delta) => {
        if (delta.insert !== undefined && typeof delta.insert === 'string') {
          return [[...changes, { from: position, to: position, insert: delta.insert }], position]
        } else if (delta.delete !== undefined) {
          return [[...changes, { from: position, to: position + delta.delete, insert: '' }], position + delta.delete]
        } else if (delta.retain !== undefined) {
          return [changes, position + delta.retain]
        } else {
          return [changes, position]
        }
      },
      [[], 0] as [ChangeSpec[], number]
    )
    return changes
  }

  public update(update: ViewUpdate): void {
    if (!update.docChanged) {
      return
    }
    update.transactions
      .filter((transaction) => transaction.annotation(syncAnnotation) !== this.conf)
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
    }, this.conf)
  }

  public destroy(): void {
    this.yText.unobserve(this.observer)
  }
}
