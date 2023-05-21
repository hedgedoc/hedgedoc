/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ChangeEvent } from 'react'
import { useCallback } from 'react'

/**
 * Takes an input change event and sends the event value to a state setter.
 *
 * @param setter The setter method for the state.
 * @return Hook that can be used as callback for onChange.
 */
export const useOnInputChange = (setter: (value: string) => void): ((event: ChangeEvent<HTMLInputElement>) => void) => {
  return useCallback((event) => setter(event.target.value), [setter])
}
