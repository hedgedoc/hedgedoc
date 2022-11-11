/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Dispatch, SetStateAction } from 'react'
import type { HistoryToolbarState } from '../history-toolbar-state'

export type HistoryToolbarStateWithDispatcher = [HistoryToolbarState, Dispatch<SetStateAction<HistoryToolbarState>>]
