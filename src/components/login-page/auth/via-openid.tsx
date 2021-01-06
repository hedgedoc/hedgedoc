/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { FormEvent, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { doOpenIdLogin } from '../../../api/auth'
import { getAndSetUser } from './utils'

export const ViaOpenId: React.FC = () => {
  useTranslation()
  const [openId, setOpenId] = useState('')
  const [error, setError] = useState(false)
  const doAsyncLogin: (() => Promise<void>) = async () => {
    await doOpenIdLogin(openId)
    await getAndSetUser()
  }

  const onFormSubmit = (event: FormEvent) => {
    doAsyncLogin().catch(() => setError(true))
    event.preventDefault()
  }

  return (
    <Card className="bg-dark mb-4">
      <Card.Body>
        <Card.Title>
          <Trans i18nKey="login.signInVia" values={{ service: 'OpenID' }}/>
        </Card.Title>

        <Form onSubmit={onFormSubmit}>
          <Form.Group controlId="openid">
            <Form.Control
              isInvalid={error}
              type="text"
              size="sm"
              placeholder={'OpenID'}
              onChange={(event) => setOpenId(event.currentTarget.value)}
              className="bg-dark text-light"
            />
          </Form.Group>

          <Alert className="small" show={error} variant="danger">
            <Trans i18nKey="login.auth.error.openIdLogin"/>
          </Alert>

          <Button
            type="submit"
            variant="primary">
            <Trans i18nKey="login.signIn"/>
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
