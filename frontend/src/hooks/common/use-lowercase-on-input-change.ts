/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useOnInputChange } from './use-on-input-change'
import type { ChangeEvent } from 'react'
import { useCallback } from 'react'

/**
 * Takes an input change event and sends the lower case event value to a state setter.
 *
 * @param setter The setter method for the state.
 * @return Hook that can be used as callback for onChange.
 */
export const useLowercaseOnInputChange = (
  setter: (value: string) => void
): ((event: ChangeEvent<HTMLInputElement>) => void) => {
  return useOnInputChange(useCallback((value) => setter(value.toLowerCase()), [setter]))
}
