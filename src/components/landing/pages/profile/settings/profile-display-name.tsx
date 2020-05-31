import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { updateDisplayName } from '../../../../../api/me'
import { ApplicationState } from '../../../../../redux'
import { getAndSetUser } from '../../../../../utils/apiUtils'

export const ProfileDisplayName: React.FC = () => {
  const regexInvalidDisplayName = /^\s*$/
  const { t } = useTranslation()
  const user = useSelector((state: ApplicationState) => state.user)
  const [submittable, setSubmittable] = useState(false)
  const [error, setError] = useState(false)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (user) {
      setDisplayName(user.name)
    }
  }, [user])

  if (!user) {
    return <Alert variant={'danger'}>User not logged in</Alert>
  }

  const changeNameField = (event: ChangeEvent<HTMLInputElement>) => {
    setSubmittable(!regexInvalidDisplayName.test(event.target.value))
    setDisplayName(event.target.value)
  }

  const doAsyncChange = async () => {
    await updateDisplayName(displayName)
    await getAndSetUser()
  }

  const changeNameSubmit = (event: FormEvent) => {
    doAsyncChange().catch(() => setError(true))
    event.preventDefault()
  }

  return (
    <Card className="bg-dark mb-4">
      <Card.Body>
        <Card.Title>
          <Trans i18nKey="profile.userProfile"/>
        </Card.Title>
        <Form onSubmit={changeNameSubmit} className="text-left">
          <Form.Group controlId="displayName">
            <Form.Label><Trans i18nKey="profile.displayName"/></Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder={t('profile.displayName')}
              value={displayName}
              className="bg-dark text-white"
              onChange={changeNameField}
              isValid={submittable}
              isInvalid={error}
              required
            />
            <Form.Text><Trans i18nKey="profile.displayNameInfo"/></Form.Text>
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            disabled={!submittable}>
            <Trans i18nKey="common.save"/>
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
