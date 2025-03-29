/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { updateUser } from '../../../api/me'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { DisplayNameField } from '../../common/fields/display-name-field'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { fetchAndSetUser } from '../../login-page/utils/fetch-and-set-user'

/**
 * Profile page section for changing the current display name.
 */
export const ProfileDisplayName: React.FC = () => {
  useTranslation()
  const userName = useApplicationState((state) => state.user?.displayName)
  const [displayName, setDisplayName] = useState(userName ?? '')
  const { showErrorNotification } = useUiNotifications()

  const onChangeDisplayName = useOnInputChange(setDisplayName)
  const onSubmitNameChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      updateUser(displayName, null)
        .then(fetchAndSetUser)
        .catch(showErrorNotification('profile.changeDisplayNameFailed'))
    },
    [displayName, showErrorNotification]
  )

  const formSubmittable = useMemo(() => {
    return displayName.trim() !== '' && displayName !== userName
  }, [displayName, userName])

  return (
    <Card className='mb-4'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='profile.userProfile' />
        </Card.Title>
        <Form onSubmit={onSubmitNameChange} className='text-left'>
          <DisplayNameField onChange={onChangeDisplayName} value={displayName} initialValue={userName} />

          <Button type='submit' variant='primary' disabled={!formSubmittable}>
            <Trans i18nKey='common.save' />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
