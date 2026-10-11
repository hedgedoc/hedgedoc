/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import type { CommonFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Renders an input field for the current password when changing passwords.
 *
 * @param onChange Hook that is called when the entered password changes.
 */
export const CurrentPasswordField: React.FC<CommonFieldProps> = ({ onChange }) => {
  const placeholderText = useTranslatedText('login.auth.password')

  return (
    <Form.Group className={'mb-2'}>
      <Form.Label>
        <Trans i18nKey='preferences.account.changePassword.old' />
      </Form.Label>
      <Form.Control
        type='password'
        size='sm'
        onChange={onChange}
        placeholder={placeholderText}
        autoComplete='current-password'
        required={true}
      />
    </Form.Group>
  )
}
