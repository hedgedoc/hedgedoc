/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Optional } from '@mrdrogdrog/optional'
import { useContext } from 'react'
import type { HistoryToolbarStateWithDispatcher } from './toolbar-context'
import { historyToolbarStateContext } from './history-toolbar-state-context-provider'

/**
 * Receives a {@link React.Context react context} for the history toolbar state.
 *
 * @throws Error if no context was set
 */
export const useHistoryToolbarState: () => HistoryToolbarStateWithDispatcher = () => {
  return Optional.ofNullable(useContext(historyToolbarStateContext)).orElseThrow(
    () => new Error('No toolbar context found. Did you forget to use the provider component?')
  )
}
