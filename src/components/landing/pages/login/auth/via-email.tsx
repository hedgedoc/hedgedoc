import { Trans, useTranslation } from 'react-i18next'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import React, { FormEvent, useState } from 'react'
import { doEmailLogin } from '../../../../../api/user'
import { getAndSetUser } from '../../../../../utils/apiUtils'

export const ViaEMail: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const doAsyncLogin = async () => {
    await doEmailLogin(email, password)
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
          <Trans i18nKey="signInVia" values={{ service: 'E-Mail' }}/>
        </Card.Title>
        <Form onSubmit={onFormSubmit}>
          <Form.Group controlId="email">
            <Form.Control
              isInvalid={error}
              type="email"
              size="sm"
              placeholder={t('email')}
              onChange={(event) => setEmail(event.currentTarget.value)} className="bg-dark text-white"
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Control
              isInvalid={error}
              type="password"
              size="sm"
              placeholder={t('password')}
              onChange={(event) => setPassword(event.currentTarget.value)}
              className="bg-dark text-white"/>
          </Form.Group>

          <Alert className="small" show={error} variant="danger">
            <Trans i18nKey="errorEmailLogin"/>
          </Alert>

          <Button
            type="submit"

            variant="primary">
            <Trans i18nKey="signIn"/>
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
