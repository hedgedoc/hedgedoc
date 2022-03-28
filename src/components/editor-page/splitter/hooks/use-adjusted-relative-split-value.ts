/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'

/**
 * Calculates the adjusted relative split value.
 *
 * @param showLeft Defines if the left split pane should be shown
 * @param showRight Defines if the right split pane should be shown
 * @param relativeSplitValue The relative size ratio of the split
 * @return the limited (0% to 100%) relative split value. If only the left or right pane should be shown then the return value will be always 100 or 0
 */
export const useAdjustedRelativeSplitValue = (
  showLeft: boolean,
  showRight: boolean,
  relativeSplitValue: number
): number =>
  useMemo(() => {
    if (!showLeft && showRight) {
      return 0
    } else if (showLeft && !showRight) {
      return 100
    } else {
      return Math.min(100, Math.max(0, relativeSplitValue))
    }
  }, [relativeSplitValue, showLeft, showRight])
