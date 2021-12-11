/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Form } from 'react-bootstrap'
import type { AuthFieldProps } from './fields'

/**
 * Renders an input field for the OpenID URL.
 * @param onChange Hook that is called when the entered OpenID URL changes.
 * @param invalid True when the entered OpenID URL is invalid, false otherwise.
 */
export const OpenidField: React.FC<AuthFieldProps> = ({ onChange, invalid }) => {
  return (
    <Form.Group>
      <Form.Control
        isInvalid={invalid}
        type='text'
        size='sm'
        placeholder={'OpenID'}
        onChange={onChange}
        className='bg-dark text-light'
      />
    </Form.Group>
  )
}
