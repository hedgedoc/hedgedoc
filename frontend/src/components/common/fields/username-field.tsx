/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CommonFieldProps } from './fields'
import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders an input field for the username when registering.
 *
 * @param onChange Hook that is called when the entered username changes.
 * @param value The currently entered username.
 */
export const UsernameField: React.FC<CommonFieldProps> = ({ onChange, value }) => {
  const { t } = useTranslation()

  const isValid = useMemo(() => {
    return value?.trim() !== ''
  }, [value])

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='login.auth.username' />
      </Form.Label>
      <Form.Control
        type='text'
        size='sm'
        value={value}
        isValid={isValid}
        onChange={onChange}
        placeholder={t('login.auth.username') ?? undefined}
        autoComplete='username'
        autoFocus={true}
        required
      />
      <Form.Text>
        <Trans i18nKey='login.register.usernameInfo' />
      </Form.Text>
    </Form.Group>
  )
}
