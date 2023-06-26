/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UsernameFieldProps } from './username-field'
import { UsernameField } from './username-field'
import React from 'react'
import { Form } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Wraps and contains label and info for UsernameField
 *
 * @param onChange Callback that is called when the entered username changes.
 * @param value The currently entered username.
 * @param isValid  Is a valid field or not
 * @param isInvalid Adds error style to label
 */
export const UsernameLabelField: React.FC<UsernameFieldProps> = (props) => {
  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='login.auth.username' />
      </Form.Label>
      <UsernameField {...props} />
      <Form.Text>
        <Trans i18nKey='login.register.usernameInfo' />
      </Form.Text>
    </Form.Group>
  )
}
