/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useRef } from 'react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Extracts the value of a specified query parameter from the current page's URL.
 * If the parameter is not found, it returns `null`.
 *
 * @param paramName The name of the query parameter to extract.
 * @returns The value of the query parameter if found, or `null` if not present.
 */
const extractSearchParam = (paramName: string): string | null => {
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get(paramName)
}

/**
 * Manages a state tied to a URL search parameter.
 * This hook synchronizes the state with the given parameter in the URL's query string and allows updates
 * to both the local state and the URL simultaneously. It has the same signature as `useState`.
 *
 * @param paramName The name of the URL search parameter to synchronize with.
 * @param defaultValue The default value for the state if the parameter is not found in the URL. Can be a value or a function returning a value.
 * @returns A tuple containing the current state value and a function to update it.
 */
export const useUrlParamState = <T extends string | null = string>(
  paramName: string,
  defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] => {
  const searchParamsReact = useSearchParams()
  const lastSetValue = useRef<T>()
  const [value, setValue] = useState<T>(() => {
    const paramValue = extractSearchParam(paramName)
    if (paramValue !== null) {
      lastSetValue.current = paramValue as T
      return paramValue as T
    } else {
      const initialValue = typeof defaultValue === 'function' ? defaultValue() : defaultValue
      lastSetValue.current = initialValue
      return initialValue
    }
  })

  const onUpdate = useCallback(
    (newValue: T | ((oldValue: T) => T)) => {
      setValue((oldValue) => {
        const finalValue = typeof newValue === 'function' ? newValue(oldValue) : newValue
        if (finalValue === lastSetValue.current) {
          return finalValue
        }
        lastSetValue.current = finalValue
        const searchParams = new URLSearchParams(window.location.search)
        if (finalValue) {
          searchParams.set(paramName, finalValue)
        } else {
          searchParams.delete(paramName)
        }
        window.history.replaceState(
          {
            [paramName]: finalValue
          },
          '',
          `?${searchParams}`
        )
        return finalValue
      })
    },
    [paramName]
  )

  useEffect(() => {
    if (!searchParamsReact) {
      return
    }
    let newValue = searchParamsReact.get(paramName) as T
    if (newValue === null) {
      newValue = typeof defaultValue === 'function' ? defaultValue() : defaultValue
    }
    if (newValue === lastSetValue.current) {
      return
    }
    lastSetValue.current = newValue
    setValue(newValue)
  }, [paramName, searchParamsReact, defaultValue])

  return [value, onUpdate]
}
