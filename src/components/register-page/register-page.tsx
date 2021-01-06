/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { FormEvent, Fragment, useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router'
import { doInternalRegister } from '../../api/auth'
import { ApplicationState } from '../../redux'
import { TranslatedExternalLink } from '../common/links/translated-external-link'
import { ShowIf } from '../common/show-if/show-if'
import { getAndSetUser } from '../login-page/auth/utils'

export enum RegisterError {
  NONE = 'none',
  USERNAME_EXISTING = 'usernameExisting',
  OTHER = 'other'
}

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const allowRegister = useSelector((state: ApplicationState) => state.config.allowRegister)
  const specialLinks = useSelector((state: ApplicationState) => state.config.specialLinks)
  const userExists = useSelector((state: ApplicationState) => !!state.user)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [error, setError] = useState(RegisterError.NONE)
  const [ready, setReady] = useState(false)

  const doRegisterSubmit = useCallback((event: FormEvent) => {
    doInternalRegister(username, password)
      .then(() => getAndSetUser())
      .catch((err: Error) => {
        console.error(err)
        setError(err.message === RegisterError.USERNAME_EXISTING ? err.message : RegisterError.OTHER)
      })
    event.preventDefault()
  }, [username, password])

  useEffect(() => {
    setReady(username !== '' && password !== '' && password.length >= 8 && password === passwordAgain)
  }, [username, password, passwordAgain])

  if (!allowRegister) {
    return (
      <Redirect to={'/login'}/>
    )
  }

  if (userExists) {
    return (
      <Redirect to={'/intro'}/>
    )
  }

  return <Fragment>
    <div className='my-3'>
      <h1 className='mb-4'><Trans i18nKey='login.register.title'/></h1>
      <Row className='h-100 d-flex justify-content-center'>
        <Col lg={6}>
          <Card className='bg-dark mb-4 text-start'>
            <Card.Body>
              <Form onSubmit={doRegisterSubmit}>
                <Form.Group controlId='username'>
                  <Form.Label><Trans i18nKey='login.auth.username'/></Form.Label>
                  <Form.Control
                    type='text'
                    size='sm'
                    value={username}
                    isValid={username !== ''}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder={t('login.auth.username')}
                    className='bg-dark text-light'
                    autoComplete='username'
                    autoFocus={true}
                    required
                  />
                  <Form.Text><Trans i18nKey='login.register.usernameInfo'/></Form.Text>
                </Form.Group>
                <Form.Group controlId='password'>
                  <Form.Label><Trans i18nKey='login.auth.password'/></Form.Label>
                  <Form.Control
                    type='password'
                    size='sm'
                    isValid={password !== '' && password.length >= 8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t('login.auth.password')}
                    className='bg-dark text-light'
                    minLength={8}
                    autoComplete='new-password'
                    required
                  />
                  <Form.Text><Trans i18nKey='login.register.passwordInfo'/></Form.Text>
                </Form.Group>
                <Form.Group controlId='re-password'>
                  <Form.Label><Trans i18nKey='login.register.passwordAgain'/></Form.Label>
                  <Form.Control
                    type='password'
                    size='sm'
                    isInvalid={passwordAgain !== '' && password !== passwordAgain}
                    isValid={passwordAgain !== '' && password === passwordAgain}
                    onChange={(event) => setPasswordAgain(event.target.value)}
                    placeholder={t('login.register.passwordAgain')}
                    className='bg-dark text-light'
                    autoComplete='new-password'
                    required
                  />
                </Form.Group>
                <ShowIf condition={!!specialLinks?.termsOfUse || !!specialLinks?.privacy}>
                  <Trans i18nKey='login.register.infoTermsPrivacy'/>
                  <ul>
                    <ShowIf condition={!!specialLinks?.termsOfUse}>
                      <li>
                        <TranslatedExternalLink i18nKey='landing.footer.termsOfUse' href={specialLinks.termsOfUse}/>
                      </li>
                    </ShowIf>
                    <ShowIf condition={!!specialLinks?.privacy}>
                      <li>
                        <TranslatedExternalLink i18nKey='landing.footer.privacy' href={specialLinks.privacy}/>
                      </li>
                    </ShowIf>
                  </ul>
                </ShowIf>
                <Button
                  variant='primary'
                  type='submit'
                  block={true}
                  disabled={!ready}>
                  <Trans i18nKey='login.register.title'/>
                </Button>
              </Form>
              <br/>
              <Alert show={error !== RegisterError.NONE} variant='danger'>
                <Trans i18nKey={`login.register.error.${error}`}/>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  </Fragment>
}
