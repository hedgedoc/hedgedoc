/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'

export const useOnRefChange = <T>(reference: MutableRefObject<T>, onChange?: (newValue: T) => void): void => {
  const lastValue = useRef<T>()
  useEffect(() => {
    if (onChange && !equal(reference.current, lastValue.current)) {
      lastValue.current = reference.current
      onChange(reference.current)
    }
  })
}
