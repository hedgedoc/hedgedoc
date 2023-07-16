/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useInterval } from 'react-use'

/**
 * Takes a value that changes often and outputs the last value that hasn't been changed in the last interval.
 *
 * @param value The value to defer
 * @param initialValue The initial value that is used until the first update
 * @param checkInterval The interval in ms that is used to check for updates. Default is 200ms.
 * @return The slowed down value
 */
export const useDeferredState = <T>(value: T, initialValue: T, checkInterval = 200): T => {
  const valueRef = useRef<T>(initialValue)
  const lastTimestamp = useRef<number>(0)
  const [deferredValue, setDeferredValue] = useState<T>(initialValue)

  useEffect(() => {
    valueRef.current = value
    lastTimestamp.current = new Date().getTime()
  }, [value])

  useInterval(
    useCallback(() => {
      const currentTimeStamp = new Date().getTime()
      if (currentTimeStamp - lastTimestamp.current >= checkInterval) {
        setDeferredValue(valueRef.current)
      }
    }, [checkInterval]),
    checkInterval
  )

  return deferredValue
}
