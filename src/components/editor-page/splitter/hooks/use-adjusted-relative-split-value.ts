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
    let splitValue: number
    if (!showLeft && showRight) {
      splitValue = 0
    } else if (showLeft && !showRight) {
      splitValue = 100
    } else {
      splitValue = relativeSplitValue
    }

    return Math.min(100, Math.max(0, splitValue))
  }, [relativeSplitValue, showLeft, showRight])
