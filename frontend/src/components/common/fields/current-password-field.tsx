/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CommonFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders an input field for the current password when changing passwords.
 *
 * @param onChange Hook that is called when the entered password changes.
 */
export const CurrentPasswordField: React.FC<CommonFieldProps> = ({ onChange }) => {
  const { t } = useTranslation()

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='profile.changePassword.old' />
      </Form.Label>
      <Form.Control
        type='password'
        size='sm'
        onChange={onChange}
        placeholder={t('login.auth.password') ?? undefined}
        autoComplete='current-password'
        required
      />
    </Form.Group>
  )
}
