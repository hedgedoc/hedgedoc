/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useInterval } from 'react-use'

const minimumTimeBetweenUpdateInterval = 200
const forceUpdateAfterTime = 1000

/**
 * Takes a value that changes often and outputs the last value that hasn't been changed in the last interval.
 *
 * @param value The value to defer
 * @param initialValue The initial value that is used until the first update
 * @return The slowed down value
 */
export const useDeferredState = <T>(value: T, initialValue: T): T => {
  const valueRef = useRef<T>(initialValue)
  const lastIncomingUpdateTimestamp = useRef<number>(0)
  const lastOutgoingUpdateTimestamp = useRef<number>(0)
  const [deferredValue, setDeferredValue] = useState<T>(initialValue)

  useEffect(() => {
    valueRef.current = value
    lastIncomingUpdateTimestamp.current = new Date().getTime()
  }, [value])

  useInterval(
    useCallback(() => {
      const currentTimeStamp = new Date().getTime()
      if (
        currentTimeStamp - lastIncomingUpdateTimestamp.current >= minimumTimeBetweenUpdateInterval ||
        currentTimeStamp - lastOutgoingUpdateTimestamp.current >= forceUpdateAfterTime
      ) {
        lastOutgoingUpdateTimestamp.current = currentTimeStamp
        setDeferredValue(valueRef.current)
      }
    }, []),
    100
  )

  return deferredValue
}
