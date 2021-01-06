/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { changePassword } from '../../../api/me'

export const ProfileChangePassword: React.FC = () => {
  useTranslation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordAgain, setNewPasswordAgain] = useState('')
  const [newPasswordValid, setNewPasswordValid] = useState(false)
  const [newPasswordAgainValid, setNewPasswordAgainValid] = useState(false)

  const regexPassword = /^[^\s].{5,}$/

  const onChangeNewPassword = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value)
    setNewPasswordValid(regexPassword.test(event.target.value))
    setNewPasswordAgainValid(event.target.value === newPasswordAgain)
  }

  const onChangeNewPasswordAgain = (event: ChangeEvent<HTMLInputElement>) => {
    setNewPasswordAgain(event.target.value)
    setNewPasswordAgainValid(event.target.value === newPassword)
  }

  const updatePasswordSubmit = async (event: FormEvent) => {
    await changePassword(oldPassword, newPassword)
    event.preventDefault()
  }

  return (
    <Card className="bg-dark mb-4">
      <Card.Body>
        <Card.Title><Trans i18nKey="profile.changePassword.title"/></Card.Title>
        <Form onSubmit={updatePasswordSubmit} className="text-left">
          <Form.Group controlId="oldPassword">
            <Form.Label><Trans i18nKey="profile.changePassword.old"/></Form.Label>
            <Form.Control
              type="password"
              size="sm"
              className="bg-dark text-light"
              required
              onChange={(event) => setOldPassword(event.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="newPassword">
            <Form.Label><Trans i18nKey="profile.changePassword.new"/></Form.Label>
            <Form.Control
              type="password"
              size="sm"
              className="bg-dark text-light"
              required
              onChange={onChangeNewPassword}
              isValid={newPasswordValid}
            />
            <Form.Text><Trans i18nKey="profile.changePassword.info"/></Form.Text>
          </Form.Group>
          <Form.Group controlId="newPasswordAgain">
            <Form.Label><Trans i18nKey="profile.changePassword.newAgain"/></Form.Label>
            <Form.Control
              type="password"
              size="sm"
              className="bg-dark text-light"
              required
              onChange={onChangeNewPasswordAgain}
              isValid={newPasswordAgainValid}
              isInvalid={newPasswordAgain !== '' && !newPasswordAgainValid}
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            disabled={!newPasswordValid || !newPasswordAgainValid}>
            <Trans i18nKey="common.save"/>
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
