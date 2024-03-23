/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import type { CommonFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'

export interface UsernameFieldProps extends CommonFieldProps {
  isInvalid?: boolean
  isValid?: boolean
  onValidityChange?: (valid: boolean) => void
}

/**
 * Renders an input field for the username when registering.
 *
 * @param onChange Callback that is called when the entered username changes.
 * @param value The currently entered username.
 * @param isValid  Is a valid field or not
 * @param isInvalid Adds error style to label
 */
export const UsernameField: React.FC<UsernameFieldProps> = ({ onChange, value, isValid, isInvalid, disabled }) => {
  const placeholderText = useTranslatedText('login.auth.username')

  return (
    <Form.Control
      type='text'
      size='sm'
      value={value}
      maxLength={64}
      isValid={isValid}
      isInvalid={isInvalid}
      onChange={onChange}
      placeholder={placeholderText}
      disabled={disabled}
      autoComplete='username'
      autoFocus={true}
      required
    />
  )
}
