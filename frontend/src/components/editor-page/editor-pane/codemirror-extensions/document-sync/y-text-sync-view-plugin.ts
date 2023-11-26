/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ChangeSpec, Transaction, Extension } from '@codemirror/state'
import { Annotation, StateEffect } from '@codemirror/state'
import type { EditorView, PluginValue, ViewUpdate } from '@codemirror/view'
import type { Text as YText, Transaction as YTransaction, YTextEvent } from 'yjs'
import { v4 as uuid } from 'uuid'
import { Logger } from '../../../../../utils/logger'
import { authorshipsUpdateEffect, type AuthorshipUpdate } from '../authorship-ranges/authorships-update-effect'
import { authorshipsStateField } from '../authorship-ranges/authorships-state-field'

const syncAnnotation = Annotation.define()

const logger = new Logger('YTextSyncViewPlugin')

/**
 * Synchronizes the content of a codemirror with a {@link YText y.js text channel}.
 */
export class YTextSyncViewPlugin implements PluginValue {
  private readonly observer: YTextSyncViewPlugin['onYTextUpdate']

  // private stalledEffects: StateEffect<AuthorshipUpdate>[] = []

  constructor(
    private view: EditorView,
    private readonly yText: YText,
    private readonly ownUserId: string = window.localStorage.getItem('realtime-id') || uuid(), // Todo remove default value
    pluginLoaded: () => void
  ) {
    this.observer = this.onYTextUpdate.bind(this)
    this.yText.observe(this.observer)
    pluginLoaded()
    logger.debug('ownUserId', ownUserId)
  }

  private onYTextUpdate(event: YTextEvent, transaction: YTransaction): void {
    logger.debug('onYTextUpdate called')
    logger.debug(event.delta)

    if (transaction.origin === this) {
      return
    }
    const changes = this.calculateChanges(event)
    const annotations = [syncAnnotation.of(this)]
    //const effects = [...this.stalledEffects, ...this.calculateEffects(event)]
    const effects = this.calculateEffects(event)

    logger.debug('changes', changes)
    logger.debug('effects', effects)

    this.view.dispatch({ changes, annotations, effects })
    // this.stalledEffects = []
  }

  private calculateChanges(event: YTextEvent): ChangeSpec[] {
    const [changes] = event.delta.reduce<[ChangeSpec[], number]>(
      ([changes, position], delta) => {
        if (delta.insert !== undefined && typeof delta.insert === 'string') {
          changes.push({ from: position, to: position, insert: delta.insert })
          return [changes, position]
        } else if (delta.delete !== undefined) {
          changes.push({ from: position, to: position + delta.delete })
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

  private calculateEffects(event: YTextEvent): StateEffect<AuthorshipUpdate | Extension>[] {
    const [effects] = event.delta.reduce<[StateEffect<AuthorshipUpdate>[], number]>(
      ([effects, position], delta) => {
        if (delta.insert !== undefined && typeof delta.insert === 'string') {
          effects.push(
            authorshipsUpdateEffect.of({
              from: position,
              to: position + delta.insert.length,
              userId: delta.attributes?.authorId as string,
              isDeletion: false
            })
          )
          return [effects, position + delta.insert.length]
        } else if (delta.delete !== undefined) {
          effects.push(
            authorshipsUpdateEffect.of({
              from: position,
              to: position + delta.delete,
              userId: null,
              isDeletion: true
            })
          )
          return [effects, position + delta.delete]
        } else if (delta.retain !== undefined) {
          return [effects, position + delta.retain]
        } else {
          return [effects, position]
        }
      },
      [[], 0]
    )
    if (!this.view.state.field(authorshipsStateField, false)) {
      return [...effects, StateEffect.appendConfig.of([authorshipsStateField])]
    }
    return effects
  }

  public update(update: ViewUpdate): void {
    if (!update.docChanged) {
      return
    }
    const ownTransactions = update.transactions.filter((transaction) => transaction.annotation(syncAnnotation) !== this)

    ownTransactions.forEach((transaction) => this.applyTransaction(transaction))
    /*ownTransactions.forEach((transaction) => {
      // todo: Add own authorship decorations
      transaction.changes.iterChanges((fromA, toA, _, __, insert) => {
        logger.debug('fromA', fromA, 'toA', toA, 'insert', insert)
        this.stalledEffects.push(
          authorshipsUpdateEffect.of({
            from: fromA,
            to: toA + insert.length,
            userId: this.ownUserId,
            localUpdate: true
          })
        )
      })
    })*/
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
          this.yText.insert(fromA + positionAdjustment, insertText, {
            authorId: this.ownUserId
          })
        }
        positionAdjustment += insertText.length - (toA - fromA)
      })
    }, this)
  }

  public destroy(): void {
    this.yText.unobserve(this.observer)
  }
}
