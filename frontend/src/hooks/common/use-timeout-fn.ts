/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useRef } from 'react'

/**
 * Creates a timer with the given timeout and callback.
 * The timer is not started automatically.
 *
 * @param timeout The timeout in milliseconds
 * @param callback The callback to execute when the time is up
 * @return [startTimer, stopTimer] Functions to start and stop the timeout
 */
export const useTimeoutFn = (timeout: number, callback: () => void) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current === null) {
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) {
      return
    }
    timerRef.current = setTimeout(callback, timeout)
  }, [callback, timeout])

  return [startTimer, stopTimer]
}
