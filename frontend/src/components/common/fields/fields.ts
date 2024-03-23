/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ChangeEventHandler } from 'react'

export interface CommonFieldProps<ValueType = undefined> {
  onChange: ValueType extends undefined ? ChangeEventHandler : (set: ValueType) => void
  value: ValueType extends undefined ? string : ValueType
  hasError?: boolean
  disabled?: boolean
}
