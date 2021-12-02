/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ChangeEvent, FormEvent } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { updateDisplayName } from '../../../api/me'
import { fetchAndSetUser } from '../../login-page/auth/utils'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'

/**
 * Profile page section for changing the current display name.
 */
export const ProfileDisplayName: React.FC = () => {
  const { t } = useTranslation()
  const userName = useApplicationState((state) => state.user?.name)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (userName !== undefined) {
      setDisplayName(userName)
    }
  }, [userName])

  const onChangeDisplayName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value)
  }, [])

  const onSubmitNameChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      updateDisplayName(displayName)
        .then(fetchAndSetUser)
        .catch(showErrorNotification('profile.changeDisplayNameFailed'))
    },
    [displayName]
  )

  const formSubmittable = useMemo(() => {
    return displayName.trim() !== ''
  }, [displayName])

  return (
    <Card className='bg-dark mb-4'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='profile.userProfile' />
        </Card.Title>
        <Form onSubmit={onSubmitNameChange} className='text-left'>
          <Form.Group controlId='displayName'>
            <Form.Label>
              <Trans i18nKey='profile.displayName' />
            </Form.Label>
            <Form.Control
              type='text'
              size='sm'
              placeholder={t('profile.displayName')}
              value={displayName}
              className='bg-dark text-light'
              onChange={onChangeDisplayName}
              isValid={formSubmittable}
              required
            />
            <Form.Text>
              <Trans i18nKey='profile.displayNameInfo' />
            </Form.Text>
          </Form.Group>

          <Button type='submit' variant='primary' disabled={!formSubmittable}>
            <Trans i18nKey='common.save' />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
