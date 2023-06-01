/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CommonFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface UsernameFieldProps extends CommonFieldProps {
  isInvalid?: boolean
  isValid?: boolean
}

/**
 * Renders an input field for the username when registering.
 *
 * @param onChange Callback that is called when the entered username changes.
 * @param value The currently entered username.
 * @param isValid  Is a valid field or not
 * @param isInvalid Adds error style to label
 */
export const UsernameField: React.FC<UsernameFieldProps> = ({ onChange, value, isValid, isInvalid }) => {
  const { t } = useTranslation()

  return (
    <Form.Control
      type='text'
      size='sm'
      value={value}
      isValid={isValid}
      isInvalid={isInvalid}
      onChange={onChange}
      placeholder={t('login.auth.username') ?? undefined}
      autoComplete='username'
      autoFocus={true}
      required
    />
  )
}
