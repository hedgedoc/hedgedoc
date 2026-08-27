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
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'

/**
 * Form for changing the current display name.
 */
export const ProfileDisplayName: React.FC = () => {
  useTranslation()
  const userName = useApplicationState((state) => state.user?.displayName)
  const [displayName, setDisplayName] = useState(userName ?? '')
  const { showErrorNotificationBuilder } = useUiNotifications()
  const { allowProfileEdits } = useFrontendConfig()

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
    <Form onSubmit={onSubmitNameChange} className='text-start mb-3'>
      <DisplayNameField onChange={onChangeDisplayName} value={displayName} initialValue={userName} />

      <Button type='submit' variant='primary' disabled={!allowProfileEdits || !formSubmittable} className='mt-3'>
        <Trans i18nKey='common.save' />
      </Button>
    </Form>
  )
}
