/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { StateEffect } from '@codemirror/state'
import { Logger } from '../../../../../utils/logger'

export interface AuthorshipUpdate {
  from: number
  to: number
  userId: string | null
  isDeletion: boolean
}

const logger = new Logger('AuthorshipsUpdateEffect')

/**
 * Used to provide a new set of {@link Authorship authorships} to a codemirror state.
 */
export const authorshipsUpdateEffect = StateEffect.define<AuthorshipUpdate>({
  map: (value, change) => {
    logger.debug('value', value)
    logger.debug('change', change)
    return { ...value, from: change.mapPos(value.from), to: change.mapPos(value.to) }
  }
})
