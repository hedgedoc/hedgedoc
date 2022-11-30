/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ChangeEvent } from 'react'

export interface AuthFieldProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  invalid: boolean
}
