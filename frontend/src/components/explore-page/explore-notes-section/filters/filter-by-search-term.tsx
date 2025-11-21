/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ChangeEvent } from 'react'
import React, { useCallback } from 'react'
import { Form } from 'react-bootstrap'

export interface FilterBySearchTermProps {
  value: string | null
  onChange: (value: string | null) => void
}

export const FilterBySearchTerm: React.FC<FilterBySearchTermProps> = ({ value, onChange }) => {
  const onInputSearchTerm = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const searchTerm = event.target.value
      if (searchTerm === '') {
        onChange(null)
      } else {
        onChange(searchTerm)
      }
    },
    [onChange]
  )

  return (
    <Form.Control
      value={value ?? ''}
      size={'sm'}
      type={'search'}
      placeholder={'Search term or tag name'}
      onInput={onInputSearchTerm}
    />
  )
}
