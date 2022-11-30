/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryToolbarState } from '../history-toolbar-state'
import type { Dispatch, SetStateAction } from 'react'

export type HistoryToolbarStateWithDispatcher = [HistoryToolbarState, Dispatch<SetStateAction<HistoryToolbarState>>]
