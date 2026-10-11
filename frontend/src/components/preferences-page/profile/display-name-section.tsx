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
import { Button, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { fetchAndSetUser } from '../../login-page/utils/fetch-and-set-user'
import { AuthProviderType } from '@hedgedoc/commons'

/**
 * Preferences section for changing the current display name.
 */
export const DisplayNameSection: React.FC = () => {
  useTranslation()
  const userName = useApplicationState((state) => state.user?.displayName)
  const isGuest = useApplicationState((state) => state.user?.authProvider === AuthProviderType.GUEST)
  const [displayName, setDisplayName] = useState(userName ?? '')
  const { showErrorNotificationBuilder } = useUiNotifications()

  const onChangeDisplayName = useOnInputChange(setDisplayName)
  const onSubmitNameChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      updateUser(displayName, null)
        .then(fetchAndSetUser)
        .catch(showErrorNotificationBuilder('profile.changeDisplayNameFailed'))
    },
    [displayName, showErrorNotificationBuilder]
  )

  const formSubmittable = useMemo(() => {
    return displayName.trim() !== '' && displayName !== userName
  }, [displayName, userName])

  return (
    <Form onSubmit={onSubmitNameChange} className='my-4'>
      <h3 className={'mb-2 h5'}>
        <Trans i18nKey='preferences.profile.displayName.title' />
      </h3>
      <DisplayNameField onChange={onChangeDisplayName} value={displayName} initialValue={userName} disabled={isGuest} />
      <Button className={'mt-2'} type='submit' variant='primary' disabled={!formSubmittable}>
        <Trans i18nKey='common.save' />
      </Button>
    </Form>
  )
}
