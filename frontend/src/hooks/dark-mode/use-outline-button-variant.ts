/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from './use-dark-mode-state'

export const useOutlineButtonVariant = (): 'outline-light' | 'outline-dark' => {
  return useDarkModeState() ? 'outline-light' : 'outline-dark'
}
