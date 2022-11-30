/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useState } from 'react'

/**
 * Provides a boolean state and two functions that set the boolean to true or false.
 *
 * @param initialState The initial value of the state
 * @return An array containing the state, and two functions that set the state value to true or false.
 */
export const useBooleanState = (
  initialState: boolean | (() => boolean) = false
): [state: boolean, setToTrue: () => void, setToFalse: () => void] => {
  const [state, setState] = useState(initialState)
  const setToFalse = useCallback(() => setState(false), [])
  const setToTrue = useCallback(() => setState(true), [])

  return [state, setToTrue, setToFalse]
}
