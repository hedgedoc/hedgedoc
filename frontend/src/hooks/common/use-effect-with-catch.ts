/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DependencyList, EffectCallback } from 'react'
import { useEffect, useState } from 'react'

/**
 * Executes a side effects but catches any thrown error.
 *
 * @param effect The side effect to execute
 * @param deps The dependencies of the effect
 * @return The produced error (if occurred)
 */
export const useEffectWithCatch = (effect: EffectCallback, deps: DependencyList = []): Error | undefined => {
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    try {
      return effect()
    } catch (error) {
      setError(error as Error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return error
}
