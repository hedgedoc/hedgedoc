import React, { FormEvent, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'

import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { doLdapLogin } from '../../../../../api/auth'
import { ApplicationState } from '../../../../../redux'
import { getAndSetUser } from '../../../../../utils/apiUtils'

export const ViaLdap: React.FC = () => {
  const { t } = useTranslation()
  const ldapCustomName = useSelector((state: ApplicationState) => state.config.customAuthNames.ldap)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const name = ldapCustomName ? `${ldapCustomName} (LDAP)` : 'LDAP'

  const doAsyncLogin = async () => {
    try {
      await doLdapLogin(username, password)
      await getAndSetUser()
    } catch {
      setError(true)
    }
  }

  const onFormSubmit = (event: FormEvent) => {
    doAsyncLogin().catch(() => setError(true))
    event.preventDefault()
  }

  return (
    <Card className="bg-dark mb-4">
      <Card.Body>
        <Card.Title>
          <Trans i18nKey="login.signInVia" values={{ service: name }}/>
        </Card.Title>
        <Form onSubmit={onFormSubmit}>
          <Form.Group controlId="username">
            <Form.Control
              isInvalid={error}
              type="text"
              size="sm"
              placeholder={t('login.auth.username')}
              onChange={(event) => setUsername(event.currentTarget.value)} className="bg-dark text-white"
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Control
              isInvalid={error}
              type="password"
              size="sm"
              placeholder={t('login.auth.password')}
              onChange={(event) => setPassword(event.currentTarget.value)}
              className="bg-dark text-white"/>
          </Form.Group>

          <Alert className="small" show={error} variant="danger">
            <Trans i18nKey="login.auth.error.ldapLogin"/>
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
