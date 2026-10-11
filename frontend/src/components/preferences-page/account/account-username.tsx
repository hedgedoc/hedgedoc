/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../hooks/common/use-application-state'

/**
 * Shows the immutable username of the current account.
 */
export const AccountUsername: React.FC = () => {
  useTranslation()
  const username = useApplicationState((state) => state.user?.username)

  return (
    <Fragment>
      <h2 className={'mb-3 h4'}>
        <Trans i18nKey='login.auth.username' />
      </h2>
      <Form.Group>
        <Form.Control value={username ?? ''} readOnly={true} />
        <Form.Text>
          <Trans i18nKey={'preferences.account.usernameInfo'} />
        </Form.Text>
      </Form.Group>
    </Fragment>
  )
}
