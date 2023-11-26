/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Range, Transaction, StateEffect } from '@codemirror/state'
import { StateField } from '@codemirror/state'
import type { DecorationSet } from '@codemirror/view'
import { Decoration, EditorView } from '@codemirror/view'
import { Logger } from '../../../../../utils/logger'
import styles from './authorship-highlight.module.scss'
import { createRealtimeColorCssClass } from '../realtime-colors/create-realtime-color-css-class'
import type { AuthorshipUpdate } from './authorships-update-effect'
import { authorshipsUpdateEffect } from './authorships-update-effect'
import { v4 as uuid } from 'uuid'

type MarkDecoration = {
  attributes?: Record<string, string>
}

const logger = new Logger('AuthorshipsStateField')
const colorSet = new Set<string>()

const createMark = (from: number, to: number, userId: string): Range<Decoration> => {
  logger.debug('createMark from', from, 'to', to, 'userId', userId)
  colorSet.add(userId)
  // ToDo: Build something more sensible
  const styleIndex = [...colorSet].indexOf(userId) % 7
  const color = createRealtimeColorCssClass(styleIndex)
  return Decoration.mark({
    class: `${styles['authorship-highlight']} ${color}`,
    attributes: {
      'data-user-id': userId
    }
  }).range(from, to)
}

/**
 * Saves the currently visible {@link RemoteCursor remote cursors}
 * and saves new cursors if a transaction with an {@link remoteCursorUpdateEffect update effect} has been dispatched.
 */
export const authorshipsStateField = StateField.define<DecorationSet>({
  create(): DecorationSet {
    return Decoration.none
  },
  update(authorshipDecorations: DecorationSet, transaction: Transaction) {
    logger.debug('decorationSet', authorshipDecorations, 'transaction', transaction)
    authorshipDecorations = authorshipDecorations.map(transaction.changes)

    const localEffects: StateEffect<AuthorshipUpdate>[] = []
    if (
      transaction.isUserEvent('input') ||
      transaction.isUserEvent('delete') ||
      transaction.isUserEvent('move') ||
      transaction.isUserEvent('undo') ||
      transaction.isUserEvent('redo')
    ) {
      transaction.changes.iterChanges((fromA, toA, _, __, insert) => {
        logger.debug('fromA', fromA, 'toA', toA, 'insert', insert)
        localEffects.push(
          authorshipsUpdateEffect.of({
            from: fromA,
            to: toA + insert.length,
            userId: window.localStorage.getItem('realtime-id') || uuid(), // TODO use proper value
            isDeletion: transaction.isUserEvent('delete')
          })
        )
      })
    }

    const remoteEffects = transaction.effects.filter((effect) => effect.is<AuthorshipUpdate>(authorshipsUpdateEffect))
    const effects = [...localEffects, ...remoteEffects]

    if (effects.length === 0) {
      return authorshipDecorations
    }

    effects.forEach((effect: StateEffect<AuthorshipUpdate>) => {
      const addedDecorations: Range<Decoration>[] = []
      const effectUserId = effect.value.userId
      const effectFrom = effect.value.from
      const effectTo = effect.value.to
      const effectLength = effectTo - effectFrom
      const effectIsDeletion = effect.value.isDeletion
      let effectHandled = false
      logger.debug(
        'eff_from',
        effectFrom,
        'eff_to',
        effectTo,
        'eff_user',
        effectUserId,
        'eff_len',
        effectLength,
        'delete',
        effectIsDeletion
      )
      logger.debug('#decorations', authorshipDecorations.size)
      authorshipDecorations = authorshipDecorations.update({
        filter: (decorationFrom: number, decorationTo: number, value) => {
          if (effectHandled) {
            return true
          }
          const decorationUserId = (value.spec as MarkDecoration).attributes?.['data-user-id'] ?? ''
          const sameUserId =
            decorationUserId === effectUserId && decorationUserId !== undefined && effectUserId !== null
          logger.debug('dec_from', decorationFrom, 'dec_to', decorationTo, 'dec_user', decorationUserId)

          if (effectIsDeletion) {
            // We don't need to do something if we delete(?)
            effectHandled = true
            return true
          }

          if (effectUserId === null) {
            logger.error('This should never happen. (Famous last words) [effectUserId === null]')
          }

          const nonNullEffectUserId = effectUserId as string

          if (sameUserId) {
            // The decoration is by the same user as the effect/change

            if (decorationFrom === effectTo || decorationTo === effectFrom) {
              const extremum = effectIsDeletion ? Math.min : Math.max
              logger.debug('before or after own text')
              // We can extend the existing decoration by adding a new one with the adjusted length
              addedDecorations.push(
                createMark(Math.min(decorationFrom, effectFrom), extremum(decorationTo, effectTo), decorationUserId)
              )
              effectHandled = true
              return false
            }

            logger.debug('In own text (extending)')
            // the authorshipsUpdateEffect already updates the length of the decoration, so we only need to recreate it
            // otherwise we would have another second decoration wrapped around the first one
            addedDecorations.push(createMark(decorationFrom, decorationTo, decorationUserId))
            effectHandled = true
            return true
          } else {
            // The decoration is by a different user than the effect/change
            // Split the decoration by inserting a third decoration in the middle
            logger.debug('in/before/after others text (splitting)')
            if (decorationFrom < effectFrom) {
              addedDecorations.push(createMark(decorationFrom, effectFrom, decorationUserId))
            }
            if (effectFrom !== effectTo) {
              addedDecorations.push(createMark(effectFrom, effectTo, nonNullEffectUserId))
            }
            if (effectTo < decorationTo) {
              addedDecorations.push(createMark(effectTo, decorationTo, decorationUserId))
            }
            effectHandled = true
            return false
          }
        },
        filterFrom: effectFrom,
        filterTo: effectTo
      })

      if (addedDecorations.length === 0 && effectFrom !== effectTo && !effectIsDeletion) {
        // on an empty decoration set add the effect
        addedDecorations.push(createMark(effectFrom, effectTo, effectUserId as string))
      }

      authorshipDecorations = authorshipDecorations.update({
        add: addedDecorations
      })
    })
    return authorshipDecorations
  },
  provide: (decorationSet) => EditorView.decorations.from(decorationSet)
})
