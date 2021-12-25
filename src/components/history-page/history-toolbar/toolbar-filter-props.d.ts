/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { HistoryToolbarState } from './history-toolbar'

export interface HistoryToolbarStateProps {
  historyToolbarState: HistoryToolbarState
  onHistoryToolbarStateUpdate: (value: Partial<HistoryToolbarState>) => void
}
